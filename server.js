app.post("/group/:group/member/:user/rank", async (req, res) => {
    if (req.headers.authorization !== TOKEN) {
        return res.status(403).json({ message: "Invalid token" });
    }
    try {
        const userId = parseInt(req.params.user);
        const rank = req.body.rank;
        console.log(`Ranking user ${userId} to rank ${rank}`);

        // Get roles
        const rolesRes = await fetch(`https://groups.roblox.com/v1/groups/${GROUP_ID}/roles`);
        const rolesData = await rolesRes.json();
        const role = rolesData.roles.find(r => r.rank === rank);
        if (!role) {
            return res.status(404).json({ message: "Rank not found" });
        }
        console.log("Found role:", role);

        // Get membership - loop through ALL pages until user is found
        let membership = null;
        let pageToken = "";

        do {
            const url = `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships?maxPageSize=100${pageToken ? `&pageToken=${pageToken}` : ""}`;
            const response = await fetch(url, {
                headers: { "x-api-key": OPEN_CLOUD_KEY }
            });
            const data = await response.json();

            membership = data.groupMemberships?.find(m => m.user === `users/${userId}`);
            if (membership) break;

            pageToken = data.nextPageToken;
        } while (pageToken);

        if (!membership) {
            return res.status(404).json({ message: "User not in group" });
        }
        console.log("Found membership:", membership);

        // Update rank
        const updateRes = await fetch(`https://apis.roblox.com/cloud/v2/${membership.path}`, {
            method: "PATCH",
            headers: {
                "x-api-key": OPEN_CLOUD_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role: `groups/${GROUP_ID}/roles/${role.id}` })
        });
        const updateData = await updateRes.json();
        console.log("Update response:", JSON.stringify(updateData));

        res.json({ success: true, data: updateData });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ message: err.message });
    }
});
