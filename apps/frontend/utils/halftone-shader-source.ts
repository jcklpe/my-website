// Shared by the live image surfaces and the prototype-derived GPU trails.
export const halftoneVertex =
  'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
export const halftoneFragment = `precision highp float;
    varying vec2 uv;
    uniform sampler2D source;
    uniform vec2 size, patternOrigin, imageSize, pixels, sampleScale;
    uniform vec2 kernel[7]; uniform float compactKernel;
    uniform float stage, cellSize, clipMode, opacity; uniform vec4 radiusX, radiusY;
    vec2 rotatePoint(vec2 p,float angle){float c=cos(angle),s=sin(angle);return vec2(c*p.x+s*p.y,-s*p.x+c*p.y);}
    float ramp(float distance){float t=clamp(distance/(cellSize*.45),0.,1.);return t<.5?t*.8:.4+(t-.5)*1.2;}
    float circle(vec2 tile,vec2 center){return ramp(length(tile-center*cellSize));}
    vec3 saturateColor(vec3 color,float amount){float luminance=dot(color,vec3(.213,.715,.072));return clamp(mix(vec3(luminance),color,amount),0.,1.);}
    vec4 composite(){
      vec2 local=vec2(uv.x,1.-uv.y)*size;
      float cover=max(size.x/imageSize.x,size.y/imageSize.y);
      vec3 photo=texture2D(source,(local-size*.5)/(imageSize*cover)+.5).rgb;
      vec2 point=local+patternOrigin;
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

// Follow 88% of page scrolling, but counter all image translation from hover or route motion.
export function halftonePatternOrigin(
  rect: { left: number; top: number },
  scrollX: number,
  scrollY: number,
  reducedMotion = false,
) {
  const scrollFollow = reducedMotion ? 1 : 0.88;
  return {
    x: rect.left + scrollX * scrollFollow,
    y: rect.top + scrollY * scrollFollow,
  };
}

export function pairedKernel(sigma: number, pixelsPerCssPixel: number) {
  const radius = Math.ceil(3 * pixelsPerCssPixel);
  if (radius > 6) return null;
  const discrete = new Float64Array(radius * 2 + 1);
  let total = 0;
  for (let n = -6; n <= 6; n++) {
    const distance = n * 0.5;
    const weight = Math.exp((-0.5 * distance * distance) / (sigma * sigma));
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
