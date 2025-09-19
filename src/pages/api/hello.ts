import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

/**
 * You can optionally use nextjs routes instead of tRPC if you prefer
 */
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ name: "John Doe" });
}
