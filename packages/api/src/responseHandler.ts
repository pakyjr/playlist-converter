import { Response } from "express";

export class ResponseHandler {

  static ok(res: Response, body?: any) {
    res.type("application/json");
    return ResponseHandler.jsonResponse(res, 200, body ?? null)
  }

  static okHtml(res: Response, body?: any) {
    res.type("html");
    return ResponseHandler.htmlResponse(res, 200, body ?? null)
  }

  static badRequest(res: Response, message?: string, info?: string) {
    return ResponseHandler.jsonResponse(res, 400, { error: message || "Bad request", info: info });
  }

  static unauthorized(res: Response, message?: string, info?: string) {
    return ResponseHandler.jsonResponse(res, 401, { error: message || "Unauthorized", info: info });
  }

  static forbidden(res: Response, message?: string, info?: string) {
    return ResponseHandler.jsonResponse(res, 403, { error: message || "Forbidden", info: info });
  }

  static notFound(res: Response, message?: string, info?: string) {
    return ResponseHandler.jsonResponse(res, 404, { error: message || "Not found", info: info });
  }

  static created(res: Response, body: any = {}) {
    return ResponseHandler.jsonResponse(res, 201, body);
  }

  static noContent(res: Response, message?: string) {
    return ResponseHandler.jsonResponse(res, 204, { error: message || "No content" }); //https://stackoverflow.com/questions/2342579/http-status-code-for-update-and-delete
  }

  static jsonResponse(res: Response, code: number, body: any) {
    res.status(code);
    return res.json(body);
  }

  static htmlResponse(res: Response, code: number, body: any) {
    res.status(code);
    return res.send(body);
  }
}