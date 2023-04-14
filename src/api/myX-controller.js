const { default: axios } = require("axios");
const express = require("express");
const https = require("https");
const router = express.Router();

const myXEndpoint = "https://apiv2.myxteam.com";
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const login = async () => {
  try {
    const deviceId = "b766d6b-f120-454e-bafd-60f00ad23fe9111";
    const username = process.env.EMAIL_MY_X_TEAM_NOI_THAT;
    const password = process.env.PASSWORD_MY_X_TEAM_NOI_THAT;

    const {
      data: {
        data: { AccessToken },
      },
    } = await axios.post(
      `${myXEndpoint}/auth/login`,
      {
        username,
        password,
      },
      {
        headers: {
          deviceid: deviceId,
        },
        httpsAgent,
      }
    );
    return AccessToken;
  } catch (error) {
    console.log("error :>> ", error);
  }
};

router.post("/", async (req, res) => {
  try {
    const {
      ProjectId,
      SectionName,
      EmailAssigned,
      TaskName,
      Description,
      StartDate,
      EndDate,
    } = req.body;
    const AccessToken = await login();

    const headers = {
      Authorization: `Bearer ${AccessToken}`,
    };
    const resProject = await axios.post(
      `${myXEndpoint}/projects/getProject`,
      {
        ProjectId,
      },
      {
        headers,
        httpsAgent,
      }
    );
    if (!resProject.data.data.ProjectId) {
      res.sendStatus(400).json("Project not found");
    }

    const [resSection, resTeamMember] = await Promise.all([
      axios.post(
        `${myXEndpoint}/sections/getSections`,
        {
          IncludeArchived: true,
          ProjectId,
        },
        {
          headers,
          httpsAgent,
        }
      ),
      axios.post(
        `${myXEndpoint}/projects/getProjectMembers`,
        {
          IncludeArchived: true,
          ProjectId,
        },
        {
          headers,
          httpsAgent,
        }
      ),
    ]);
    const section = resSection.data.data.find(
      (item) => item.SectionName === SectionName
    )?.SectionId;
    const assigned = resTeamMember.data.data.find(
      (item) => item.User.Email === EmailAssigned
    )?.UserId;

    const resPost = await axios.post(
      `${myXEndpoint}/tasks/createTask`,
      {
        ProjectId,
        TaskName,
        SectionId: section,
        AssignedId: assigned,
        Description: `<p>${Description}</p>`,
        StartDateUnix: Math.floor(new Date(StartDate.replace(/(\d+[/])(\d+[/])/, '$2$1')).getTime() / 1000),
        DueDateUnix: Math.floor(new Date(EndDate.replace(/(\d+[/])(\d+[/])/, '$2$1')).getTime() / 1000),
        Followers: [],
        IsComplete: false,
      },
      {
        headers,
        httpsAgent,
      }
    );
    res.send("API Success");
  } catch (error) {
    console.log("error :>> ", error);
    console.log("error :>> ", error?.response?.data);
    res.sendStatus(500);
  }
});

router.post("/finished", async (req, res) => {
  try {
    const { TaskId, Links, Comment } = req.body;

    const AccessToken = await login();

    const headers = {
      Authorization: `Bearer ${AccessToken}`,
    };
    const mapLinks = Links.map((item) => ({ Link: item }));
    await Promise.all([
      axios.post(
        `${myXEndpoint}/Files/addFiles`,
        {
          TaskId,
          Files: mapLinks,
        },
        {
          headers,
          httpsAgent,
        }
      ),
      axios.post(
        `${myXEndpoint}/tasks/addComment`,
        {
          TaskId,
          Content: Comment,
        },
        {
          headers,
          httpsAgent,
        }
      ),
      axios.post(
        `${myXEndpoint}/tasks/updateTaskCompleted`,
        {
          TaskId,
          IsCompleted: true,
        },
        {
          headers,
          httpsAgent,
        }
      ),
    ]);

    res.sendStatus(200);
  } catch (error) {
    console.log("error :>> ", error);
    console.log("error :>> ", error?.response?.data);

    res.sendStatus(500);
  }
});
module.exports = router;
