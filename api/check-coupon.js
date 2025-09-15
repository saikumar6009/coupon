import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => { data += chunk; });
      req.on("end", () => {
        try { resolve(JSON.parse(data || "{}")); }
        catch (err) { reject(err); }
      });
    });

    const { coupon, cartId, authToken, userId, pin } = body;
    if (!coupon || !cartId || !authToken || !userId || !pin) {
      return res.status(400).json({ error: "Missing required fields", body });
    }

    const response = await axios.get(
      "https://www.jiomart.com/mst/rest/v1/5/cart/apply_coupon",
      {
        params: { coupon_code: coupon, cart_id: cartId },
        headers: {
          authtoken: authToken,
          userid: userId,
          pin: pin,
          Accept: "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 10000
      }
    );

    return res.status(200).json({ coupon, result: response.data });
  } catch (err) {
    return res.status(500).json({
      error: err.response?.data || err.message || "Unknown error"
    });
  }
}
