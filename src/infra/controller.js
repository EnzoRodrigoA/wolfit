import * as cookie from "cookie";
import session from "#src/v1/models/session.js";

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
    sameSite: "none",
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
    sameSite: "none",
  });

  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
