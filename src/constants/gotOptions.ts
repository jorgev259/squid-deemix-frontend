import { CookieJar } from 'tough-cookie'

const cookieJar = new CookieJar()
cookieJar.setCookie(`arl=${process.env.DEEZER_ARL || ''};domain=.deezer.com;path=/;httpOnly=true`, "https://www.deezer.com")

export const gotOptions = {
  cookieJar
}