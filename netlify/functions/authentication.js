const ImageKit = require("imagekit");
const express = require("express");
const app = express();
app.use(express.json());

const imagekit = new ImageKit({
    publicKey: "public_caIZl6ZsAWLfN3fjvcMzQnpPSD0=",
    privateKey: "private_8KY6************************",
    urlEndpoint: "https://ik.imagekit.io/adembayazit"
});

app.post("/auth", (req, res) => {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.status(200).json(authenticationParameters);
    } catch (error) {
        res.status(500).json({ error: "Authentication hatası" });
    }
});

app.listen(3000, () => {
    console.log("Sunucu 3000 portunda çalışıyor");
});
