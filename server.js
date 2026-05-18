{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require("express");\
const noblox = require("noblox.js");\
\
const app = express();\
\
app.use(express.json());\
\
const GROUP_ID = 33631972;\
\
const TOKEN = process.env.API_TOKEN;\
const COOKIE = process.env.ROBLOX_COOKIE;\
\
async function start() \{\
\
    try \{\
\
        await noblox.setCookie(COOKIE);\
\
        const currentUser = await noblox.getCurrentUser();\
\
        console.log(`Logged in as $\{currentUser.UserName\}`);\
\
    \} catch(err) \{\
\
        console.log(err);\
\
    \}\
\
\}\
\
start();\
\
app.post("/group/:group/member/:user/rank", async (req, res) => \{\
\
    if(req.headers.authorization !== TOKEN) \{\
\
        return res.status(403).json(\{\
            message: "Invalid token"\
        \});\
\
    \}\
\
    try \{\
\
        const userId = parseInt(req.params.user);\
        const rank = req.body.rank;\
\
        await noblox.setRank(\
            GROUP_ID,\
            userId,\
            rank\
        );\
\
        res.json(\{\
            success: true\
        \});\
\
    \} catch(err) \{\
\
        console.log(err);\
\
        res.status(500).json(\{\
            message: err.message\
        \});\
\
    \}\
\
\});\
\
app.listen(3000, () => \{\
\
    console.log("Ranking API Running");\
\
\});}