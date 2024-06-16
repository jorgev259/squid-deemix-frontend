import deezer from 'deezer-js';
// import deemix from 'deemix';

const deezerClient = new deezer.Deezer();

export async function getDeezerClient() {
  if (!process.env.DEEZER_ARL) throw new Error('DEEZER_ARL environment variable not set')
  if (!deezerClient.logged_in) await deezerClient.login_via_arl(process.env.DEEZER_ARL)

  return deezerClient
}