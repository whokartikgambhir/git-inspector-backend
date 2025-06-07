// external dependencies
import { Request, Response, NextFunction } from "express";
import { Octokit } from "@octokit/rest";

export const authenticateWithPAT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const pat = authHeader.split("Bearer ")[1];

  try {
    const octokit = new Octokit({ auth: pat });
    const { data } = await octokit.users.getAuthenticated();

    // Attach user to the request
    (req as any).user = {
      username: data.login,
      token: pat,
    };

    next();
  } catch (error: any) {
    console.error("GitHub PAT authentication failed:", error?.message);
    return res.status(401).json({ error: "Invalid or expired GitHub token" });
  }
};
