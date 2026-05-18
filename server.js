const express = require("express");
const app = express();
app.use(express.json());

const GROUP_ID = 33631972;
const TOKEN = process.env.API_TOKEN;
const OPEN_CLOUD_KEY = process.env.ROBLOX_OPEN_CLOUD_KEY;

app.post("/group/:group/member/:user/rank", async (req, res) => {
    if (req.headers.authorization !== TOKEN) {
        return res.status(403).json({ message: "Invalid token" });
    }

    try {
        const userId = parseInt(req.params.user);
        const rank = req.body.rank;

        // First get the role ID from the rank number
        const rolesRes = await fetch(`https://groups.roblox.com/v1/groups/${GROUP_ID}/roles`);
        const rolesData = await rolesRes.json();
        const role = rolesData.roles.find(r => r.rank === rank);

        if (!role) {
            return res.status(404).json({ message: "Rank not found" });
        }

        // Set the rank using Open Cloud
        const response = await fetch(`https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships?filter=user==users/${userId}`, {
            headers: {
                "x-api-key": OPEN_CLOUD_KEY
            }
        });

        const data = await response.json();
        const membership = data.groupMemberships?.[0];

        if (!membership) {
            return res.status(404).json({ message: "User not in group" });
        }

        const updateRes = await fetch(`https://apis.roblox.com/cloud/v2/${membership.path}`, {
            method: "PATCH",
            headers: {
                "x-api-key": OPEN_CLOUD_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role: `groups/${GROUP_ID}/roles/${role.id}` })
        });

        const updateData = await updateRes.json();
        res.json({ success: true, data: updateData });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.listen(3000, () => {
    console.log("Ranking API Running");
});
