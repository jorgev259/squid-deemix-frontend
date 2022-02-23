export async function querySearch(q) {
  let response = await fetch(`http://localhost:4500/api/search?search=${encodeURI(q)}`);
  return await response.json();
}

export async function queryTracks(id) {
  let response = await fetch(`http://localhost:4500/api/album?id=${id}`);
  return await response.json();
}