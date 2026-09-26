async function test() {
  const url = "http://127.0.0.1:3002/api/image-proxy?url=" + encodeURIComponent("http://cms.my-website.localhost/wp-content/uploads/2026/05/image-6.png");
  console.log("Fetching", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (!res.ok) {
    console.log("Error:", await res.text());
  } else {
    console.log("Size:", (await res.arrayBuffer()).byteLength);
  }
}
test();
