// @ts-nocheck
// S55: preserve S53 presentation while pairing the discrete blur kernel into linear-filtered texture samples.
export async function installHalftone(trailOnly=false) {
  trailOnly=trailOnly===true;
  const report = { status:'initializing', draws:0, uploads:0, errors:[], surfaces:0, trailDraws:0, cellSize:11, contexts:1, frameCosts:[], allocations:0 };
  if(trailOnly){window.__halftoneShader.trailRenderer=report;window.__halftoneShader.contexts=2;}else window.__halftoneShader=report;
  const status = text => { report.status=text;if(trailOnly)return;const badge=document.getElementById('shader-status');if(badge)badge.textContent=badge.dataset.label+' — '+text; };
  const gpu=document.createElement('canvas');
  const gl=gpu.getContext('webgl',{alpha:trailOnly,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
  if(!gl){status('Unavailable — original photos');return;}
  const vertex='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
  const fragment=`precision highp float;
    varying vec2 uv;
    uniform sampler2D source;
    uniform vec2 size, origin, imageSize, pixels, sampleScale;
    uniform vec2 kernel[7]; uniform float compactKernel;
    uniform float stage, cellSize, anchored, clipMode, opacity; uniform vec4 radiusX, radiusY;
    vec2 rotatePoint(vec2 p,float angle){float c=cos(angle),s=sin(angle);return vec2(c*p.x+s*p.y,-s*p.x+c*p.y);}
    float ramp(float distance){float t=clamp(distance/(cellSize*.45),0.,1.);return t<.5?t*.8:.4+(t-.5)*1.2;}
    float circle(vec2 tile,vec2 center){return ramp(length(tile-center*cellSize));}
    vec3 saturateColor(vec3 color,float amount){float luminance=dot(color,vec3(.213,.715,.072));return clamp(mix(vec3(luminance),color,amount),0.,1.);}
    vec4 composite(){
      vec2 local=vec2(uv.x,1.-uv.y)*size;
      float cover=max(size.x/imageSize.x,size.y/imageSize.y);
      vec3 photo=texture2D(source,(local-size*.5)/(imageSize*cover)+.5).rgb;
      vec2 point=local+origin*anchored;
      vec2 y=mod(rotatePoint(point,.523598776),cellSize);
      vec2 cm=mod(rotatePoint(point,-.366519143)-vec2(cellSize*.58,0.),cellSize);
      float yellow=circle(y,vec2(.25))*circle(y,vec2(.75));
      float magenta=circle(cm,vec2(.75,.25))*circle(cm,vec2(.25,.75));
      float cyan=circle(cm,vec2(.75))*circle(cm,vec2(.25));
      vec3 hues=saturateColor(photo*.75+.25,2.);
      vec3 screened=1.-(1.-hues)*(1.-vec3(cyan,magenta,yellow));
      // CSS soft K: two gradients screened over grayscale(.8), then blurred without threshold.
      float d=clamp(length(y-vec2(.25)*cellSize)/(cellSize*.45),0.,1.);
      float first=d<.6666667?d*1.2:.8+(d-.6666667)*.6;
      float second=clamp(length(y-vec2(.75)*cellSize)/(cellSize*.45),0.,1.);
      float k=1.-(1.-dot(photo,vec3(.2126,.7152,.0722))*.8)*(1.-first*second);
      return vec4(screened*.635,k);
    }
    void main(){
      if(stage<.5){gl_FragColor=composite();return;}
      bool firstBlur=stage<2.5;
      float sigma=firstBlur?1.1:.6;
      vec2 direction=(stage==1.||stage==3.)?vec2(1.,0.):vec2(0.,1.);
      // Gaussian blur radius in CSS pixels, independent of backing resolution.
      vec4 value=vec4(0.);float total=0.;
      if(compactKernel>.5){
        // The CPU distributes the original half-CSS-pixel taps onto texel centers, then combines adjacent texels using hardware linear interpolation.
        for(int n=0;n<7;n++){
          vec2 tap=kernel[n];
          value+=texture2D(source,clamp(uv+direction*tap.x/pixels,.5/pixels,1.-.5/pixels)*sampleScale)*tap.y;
        }
      }else{
      for(int n=-6;n<=6;n++){
        float distance=float(n)*.5;
        float weight=exp(-.5*distance*distance/(sigma*sigma));
        value+=texture2D(source,clamp(uv+direction*distance/size, .5/pixels, 1.-.5/pixels)*sampleScale)*weight;total+=weight;
      }
      value/=total;
      }
      if(stage==2.)value.rgb=clamp((value.rgb-.5)*1000.+.5,0.,1.);
      if(stage==4.){
        vec3 color=value.rgb*value.a;
        vec3 sepia=vec3(dot(color,vec3(.393,.769,.189)),dot(color,vec3(.349,.686,.168)),dot(color,vec3(.272,.534,.131)));
        color=clamp(mix(color,sepia,.35),0.,1.);
        float alpha=opacity;
        if(clipMode>0.){
          vec2 local=vec2(uv.x,1.-uv.y)*size, r=vec2(0.), center=vec2(0.);
          if(local.x<radiusX.x&&local.y<radiusY.x){r=vec2(radiusX.x,radiusY.x);center=r;}
          else if(local.x>size.x-radiusX.y&&local.y<radiusY.y){r=vec2(radiusX.y,radiusY.y);center=vec2(size.x-r.x,r.y);}
          else if(local.x>size.x-radiusX.z&&local.y>size.y-radiusY.z){r=vec2(radiusX.z,radiusY.z);center=size-r;}
          else if(local.x<radiusX.w&&local.y>size.y-radiusY.w){r=vec2(radiusX.w,radiusY.w);center=vec2(r.x,size.y-r.y);}
          if(r.x>0.&&r.y>0.){float edge=length((local-center)/r);alpha*=1.-smoothstep(1.-.5/min(r.x,r.y),1.+.5/min(r.x,r.y),edge);}
        }
        gl_FragColor=vec4(saturateColor(color,1.5)*alpha,alpha);
      }else gl_FragColor=value;
    }`;
  function compile(type,text){const shader=gl.createShader(type);gl.shaderSource(shader,text);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;}
  const program=gl.createProgram();
  try {for(const type of [gl.VERTEX_SHADER,gl.FRAGMENT_SHADER]){const shader=compile(type,type===gl.VERTEX_SHADER?vertex:fragment);gl.attachShader(program,shader);gl.deleteShader(shader);}gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}
  catch(error){report.errors.push(String(error));status('Shader error — original photos');return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const u=Object.fromEntries(['kernel[0]','compactKernel','source','size','origin','imageSize','pixels','sampleScale','clipMode','opacity','radiusX','radiusY','stage','cellSize','anchored'].map(n=>[n,gl.getUniformLocation(program,n)]));
  gl.uniform1i(u.source,0);gl.uniform1f(u.cellSize,11);gl.uniform1f(u.anchored,1);
  function texture(){
    const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;
  }
  const targets=[0,1].map(()=>({texture:texture(),framebuffer:gl.createFramebuffer()}));
  const prepared=new Map();const surfaces=new Map();let raf=0,activeUntil=0,lost=false;
  const originalDraw=CanvasRenderingContext2D.prototype.drawImage;
  
  function sourceFor(image){
    if(!(image instanceof HTMLImageElement))return null;
    return image.dataset.originalSrc || null;
  }
  
  async function prepareImage(url) {
    if (prepared.has(url)) return prepared.get(url);
    const p = new Promise(async (resolve) => {
      try{
        const proxiedUrl = '/api/image-proxy?url=' + encodeURIComponent(url);
        const response=await fetch(proxiedUrl);
        if(!response.ok)throw Error('HTTP '+response.status);
        const bitmap=await createImageBitmap(await response.blob());
        const t=texture();
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bitmap);
        const data = {texture:t,width:bitmap.width,height:bitmap.height};
        prepared.set(url, data);
        bitmap.close();
        report.uploads++;
        resolve(data);
        schedule(100);
      } catch(error) {
        report.errors.push(String(error));
        resolve(null);
        schedule(100);
      }
    });
    prepared.set(url, p);
    return p;
  }
  
  function pairedKernel(sigma, pixelsPerCssPixel) {
    const radius = Math.ceil(3 * pixelsPerCssPixel);
    if (radius > 6) return null;
    const discrete = new Float64Array(radius * 2 + 1);
    let total = 0;
    for (let n = -6; n <= 6; n++) {
      const distance = n * 0.5;
      const weight = Math.exp(-0.5 * distance * distance / (sigma * sigma));
      const offset = distance * pixelsPerCssPixel;
      const left = Math.floor(offset);
      const fraction = offset - left;
      discrete[left + radius] += weight * (1 - fraction);
      if (fraction > 0) discrete[left + radius + 1] += weight * fraction;
      total += weight;
    }
    const pairs = new Float32Array(14);
    for (let i = 0; i < discrete.length; i += 2) {
      const leftWeight = discrete[i];
      const rightWeight = discrete[i + 1] || 0;
      const combined = leftWeight + rightWeight;
      pairs[i] = i - radius + rightWeight / combined;
      pairs[i + 1] = combined / total;
    }
    return pairs;
  }
  let bufferWidth=0,bufferHeight=0;
  function render(photo,rect,alpha=1,corners=[]){
    const dpr=Math.min(devicePixelRatio,1.5),w=Math.max(1,Math.ceil(rect.width*dpr)),h=Math.max(1,Math.ceil(rect.height*dpr));
    if(!trailOnly&&(gpu.width<w||gpu.height<h)){
      gpu.width=Math.ceil(Math.max(w,gpu.width)/256)*256;gpu.height=Math.ceil(Math.max(h,gpu.height)/256)*256;
    }
    if(bufferWidth<w||bufferHeight<h){
      bufferWidth=Math.ceil(Math.max(w,bufferWidth)/256)*256;bufferHeight=Math.ceil(Math.max(h,bufferHeight)/256)*256;report.allocations++;
      for(const target of targets){gl.bindTexture(gl.TEXTURE_2D,target.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,bufferWidth,bufferHeight,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,target.texture,0);}
    }
    gl.viewport(0,0,w,h);gl.uniform2f(u.sampleScale,w/bufferWidth,h/bufferHeight);gl.uniform2f(u.pixels,w,h);gl.uniform2f(u.size,rect.width,rect.height);gl.uniform2f(u.origin,rect.left,rect.top);gl.uniform2f(u.imageSize,photo.width,photo.height);
    gl.uniform1f(u.clipMode,trailOnly?1:0);gl.uniform1f(u.opacity,alpha);
    if(trailOnly){
      const scale=Math.min(1,rect.width/(corners[0].x+corners[1].x),rect.width/(corners[2].x+corners[3].x),rect.height/(corners[0].y+corners[3].y),rect.height/(corners[1].y+corners[2].y));
      gl.uniform4f(u.radiusX,...corners.map(r=>r.x*scale));gl.uniform4f(u.radiusY,...corners.map(r=>r.y*scale));
    }
    const kernels=[null,pairedKernel(1.1,w/rect.width),pairedKernel(1.1,h/rect.height),pairedKernel(.6,w/rect.width),pairedKernel(.6,h/rect.height)];
    for(let stage=0;stage<5;stage++){
      const kernel=kernels[stage];
      gl.uniform1f(u.compactKernel,kernel?1:0);
      if(kernel)gl.uniform2fv(u['kernel[0]'],kernel);
      if(trailOnly&&stage===4){
        gl.viewport(Math.round(rect.left*dpr),gpu.height-Math.round((rect.top+rect.height)*dpr),w,h);
        gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      }else {gl.disable(gl.BLEND);gl.viewport(0,0,w,h);}
      gl.bindFramebuffer(gl.FRAMEBUFFER,stage===4?null:targets[stage%2].framebuffer);
      gl.bindTexture(gl.TEXTURE_2D,stage===0?photo.texture:targets[(stage-1)%2].texture);
      gl.uniform1f(u.stage,stage);gl.drawArrays(gl.TRIANGLES,0,6);
    }
    report.draws++;return {canvas:gpu,width:w,height:h};
  }
  if(trailOnly){
    const originalClear=CanvasRenderingContext2D.prototype.clearRect;
    const originalRound=CanvasRenderingContext2D.prototype.roundRect;
    const clips=new WeakMap();
    gpu.className='s53-live-trails';gpu.setAttribute('aria-hidden','true');
    gpu.style.cssText='position:fixed;inset:0;pointer-events:none;width:100vw;height:100vh';
    CanvasRenderingContext2D.prototype.roundRect=function(left,top,width,height,corners){
      if(this.canvas.classList.contains('featured-media-trails'))clips.set(this,{left,top,width,height,corners});
      return originalRound.apply(this,arguments);
    };
    CanvasRenderingContext2D.prototype.clearRect=function(){
      if(!lost&&this.canvas.classList.contains('featured-media-trails')){
        const dpr=Math.min(devicePixelRatio,1.5),w=Math.ceil(innerWidth*dpr),h=Math.ceil(innerHeight*dpr);
        if(gpu.width!==w||gpu.height!==h){gpu.width=w;gpu.height=h;}
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      }
      return originalClear.apply(this,arguments);
    };
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      const frame=document.querySelector('.ftml-layer--media .frame img');
      const url=sourceFor(image instanceof ImageBitmap?frame:image);
      if (url && !prepared.has(url)) { prepareImage(url); }
      const photo=url&&prepared.get(url),clip=clips.get(this);
      if(!lost&&photo&&!(photo instanceof Promise)&&clip&&this.canvas.classList.contains('featured-media-trails')&&args.length===4){
        if(gpu.parentElement!==this.canvas.parentElement)this.canvas.parentElement.append(gpu);
        render(photo,clip,this.globalAlpha,clip.corners);report.trailDraws++;window.__halftoneShader.trailDraws++;
        return;
      }
      return originalDraw.call(this,image,...args);
    };
    gpu.addEventListener('webglcontextlost',event=>{event.preventDefault();window.dispatchEvent(new Event('s53-context-lost'));});
    window.addEventListener('s53-context-lost',()=>{lost=true;gpu.remove();report.status='context lost';});
    window.addEventListener('pagehide',()=>{lost=true;gpu.remove();CanvasRenderingContext2D.prototype.drawImage=originalDraw;CanvasRenderingContext2D.prototype.roundRect=originalRound;CanvasRenderingContext2D.prototype.clearRect=originalClear;});
    window.__s53Trail={gpu,report};return;
  }
  await installHalftone(true);
  function scan(){
    for(const image of document.querySelectorAll('img[data-featured-media-treatment="case-study-halftone"]')){
      const url=sourceFor(image);
      if(!url||surfaces.has(image))continue;
      if(!prepared.has(url)){prepareImage(url);continue;}
      const photo=prepared.get(url);if(!photo || photo instanceof Promise)continue;
      const canvas=document.createElement('canvas');canvas.className='s51-live-photo';canvas.setAttribute('aria-hidden','true');
      canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      const parent=image.parentElement;if(getComputedStyle(parent).position==='static')parent.style.position='relative';
      const context=canvas.getContext('2d'),rect=image.getBoundingClientRect();
      if(rect.width&&rect.height&&rect.bottom>0&&rect.top<innerHeight){
        const output=render(photo,rect);canvas.width=output.width;canvas.height=output.height;
        originalDraw.call(context,output.canvas,0,output.canvas.height-output.height,output.width,output.height,0,0,output.width,output.height);
      }
      parent.append(canvas);surfaces.set(image,{canvas,context,photo,key:''});
    }
    for(const [image,surface]of surfaces){if(!image.isConnected){surface.canvas.remove();surfaces.delete(image);}}
    report.surfaces=surfaces.size;
    let debugBox=document.getElementById('shader-status-box');
    if(!debugBox){
      debugBox=document.createElement('div');
      debugBox.id='shader-status-box';
      debugBox.style.cssText='position:fixed;top:0;left:0;z-index:9999;background:black;color:lime;padding:10px;font-family:monospace;white-space:pre-wrap;';
      document.body.append(debugBox);
    }
    debugBox.textContent = `Status: ${report.status}\nSurfaces: ${report.surfaces}\nUploads: ${report.uploads}\nErrors: ${report.errors.join(', ')}`;
  }
  function draw(time){
    raf=0;if(lost||document.hidden)return;
    const started=performance.now();scan();
    for(const [image,surface]of surfaces){
      const rect=image.getBoundingClientRect();if(!rect.width||!rect.height||rect.bottom<0||rect.top>innerHeight||rect.right<0||rect.left>innerWidth)continue;
      // Local canvas follows the same crop and inherited clipping; native img remains the accessible source/failure fallback.
      const parent=image.parentElement, parentRect=parent.getBoundingClientRect();
      const scaleX=parentRect.width/parent.offsetWidth||1, scaleY=parentRect.height/parent.offsetHeight||1;
      const computed=getComputedStyle(image);
      const key=[rect.x,rect.y,rect.width,rect.height,image.currentSrc,computed.opacity].join(':');if(key===surface.key)continue;
      surface.canvas.style.left=((rect.left-parentRect.left)/scaleX-parent.clientLeft)+'px';
      surface.canvas.style.top=((rect.top-parentRect.top)/scaleY-parent.clientTop)+'px';
      surface.canvas.style.width=rect.width/scaleX+'px';surface.canvas.style.height=rect.height/scaleY+'px';
      surface.canvas.style.opacity=computed.opacity;
      const output=render(surface.photo,rect);if(surface.canvas.width!==output.width)surface.canvas.width=output.width;if(surface.canvas.height!==output.height)surface.canvas.height=output.height;
      originalDraw.call(surface.context,output.canvas,0,output.canvas.height-output.height,output.width,output.height,0,0,output.width,output.height);surface.key=key;
    }
    report.frameCosts.push(performance.now()-started);if(report.frameCosts.length>500)report.frameCosts.shift();
    status('LIVE throughout — 11px dots');
    if(time<activeUntil||document.querySelector('.ftml-layer--media'))raf=requestAnimationFrame(draw);
  }
  function schedule(duration=0){activeUntil=Math.max(activeUntil,performance.now()+duration);if(!raf&&!lost)raf=requestAnimationFrame(draw);}
  const observer=new MutationObserver(records=>{if(records.every(r=>r.target.id==='shader-status'||r.target.classList?.contains('s51-live-photo')))return;scan();schedule(300);});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','src','srcset']});
  addEventListener('scroll',()=>schedule(150),{passive:true});addEventListener('resize',()=>schedule(300));
  document.addEventListener('click',()=>schedule(Number(new URLSearchParams(location.search).get('speed')||200)+2500),true);
  document.addEventListener('pointerover',()=>schedule(400),{passive:true});document.addEventListener('pointerout',()=>schedule(400),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else schedule();});
  gpu.addEventListener('webglcontextlost',event=>{event.preventDefault();window.dispatchEvent(new Event('s53-context-lost'));});
  window.addEventListener('s53-context-lost',()=>{lost=true;cancelAnimationFrame(raf);observer.disconnect();for(const surface of surfaces.values())surface.canvas.remove();status('Context lost — original photos');});
  window.addEventListener('pagehide',()=>{lost=true;cancelAnimationFrame(raf);observer.disconnect();CanvasRenderingContext2D.prototype.drawImage=originalDraw;for(const p of prepared.values())gl.deleteTexture(p.texture);for(const t of targets){gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);}gl.deleteBuffer(buffer);gl.deleteProgram(program);});
  window.__s51={render,prepared,gpu,schedule};schedule(500);
}
