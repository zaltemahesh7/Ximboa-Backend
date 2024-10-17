const axios = require("axios");

const getUserIfo = async (req, res) => {
  const accessToken = req.headers["authorization"].split(" ")[1];

  try {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, localizedFirstName, localizedLastName, emailAddress } =
      response.data;
    let user = await registration.findOne({ email_id: emailAddress });

    if (!user) {
      // If user doesn't exist, create a new user
      user = new registration({
        f_Name: localizedFirstName,
        l_Name: localizedLastName,
        email_id: emailAddress,
        password: localizedFirstName,
      });

      await user.save();
    }

    const payload = {
      id: user.id,
      role: user.role,
      username: user.email_id,
    };
    const token = generateToken(payload, req);
    console.log(token);
    res.json({ data: response.data, token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving user info");
  }
};

// Endpoint to get the access token
const linkedInAccessToken = async (req, res) => {
  const { code } = req.body;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${process.env.FRONTEND_URL}/auth/linkedin`;

  console.log("Data", { clientId, clientSecret, redirectUri });

  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving access token");
  }
};

module.exports = { getUserIfo, linkedInAccessToken };
