const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('\n=== RECEIVED REQUEST ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`Body:`, JSON.stringify(req.body, null, 2));
    console.log('========================\n');
    next();
});

const MatchmakingHost = "204.12.195.98";
const MatchmakingPort = 9000;

const matchmakingUDPServerDiscoveryPayload = {
  servers: [
    { location_id: 6, region_id: "336d1f3e-3ecb-11eb-a7dc-3b7705f20f56", ipv4: MatchmakingHost, ipv6: "", port: MatchmakingPort },
    { location_id: 10, region_id: "11111111-2222-4333-8444-555555555501", ipv4: MatchmakingHost, ipv6: "", port: MatchmakingPort },
  ],
};

app.get("/", (req, res) => {
  res.status(200).json(matchmakingUDPServerDiscoveryPayload);
});

app.post("/recordClientStatus", (req, res) => {
    res.status(200).json({}); 
});

app.post("//connectServer", (req, res) => {
    const loginToken = req.body.loginToken;
    const platform = req.body.platform;
    const playerId = req.body.playerId;
    const version = req.body.version;

    console.log("Connection Request:", {
        platform,
        playerId,
        version
    });

    res.status(200).json({
        "error": 0,
        "userId": playerId,
        "aceId": "test",
        "gateToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
        "endpoint": "204.12.195.98:6969",
    });
});

app.post("/connectServer", (req, res) => {
    const loginToken = req.body.loginToken;
    const platform = req.body.platform;
    const playerId = req.body.playerId;
    const version = req.body.version;

    console.log("Connection Request:", {
        platform,
        playerId,
        version
    });

    res.status(200).json({
        "error": 0,
        "userId": playerId,
        "aceId": "test",
        "gateToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
        "endpoint": "204.12.195.98:6969",
    });
});

const net = require('net');

const protobuf = require("protobufjs");

const crypto = require("crypto");

function WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes){
  let Root = protobuf.loadSync("./game/proto/Response/ResponseWrapper.proto");

  let ResponseWrapperType = Root.lookupType("ProjectBoundary.ResponseWrapper");

  let ResponseWrapper = ResponseWrapperType.create({MessageId: MessageId, RPCPath: RPCPath, ErrorCode: 0, Message: ResponseBytes});
  let ResponsePayload = ResponseWrapperType.encode(ResponseWrapper).finish();
  let ResponseLengthHeader = Buffer.alloc(4);
  ResponseLengthHeader.writeUint32BE(ResponsePayload.length);

  return Buffer.concat([ResponseLengthHeader, ResponsePayload]);
}

function WrapJSONMessageAndSerialize(MessageId, RPCPath, ResponseJSON){
  let Root = protobuf.loadSync("./game/proto/Response/JSONResponseWrapper.proto");

  let ResponseWrapperType = Root.lookupType("ProjectBoundary.JSONResponseWrapper");

  let ResponseWrapper = ResponseWrapperType.create({MessageId: MessageId, RPCPath: RPCPath, ErrorCode: 0, JSONMessage: JSON.stringify(ResponseJSON)});
  let ResponsePayload = ResponseWrapperType.encode(ResponseWrapper).finish();
  let ResponseLengthHeader = Buffer.alloc(4);
  ResponseLengthHeader.writeUint32BE(ResponsePayload.length);

  return Buffer.concat([ResponseLengthHeader, ResponsePayload]);
}

const ObjectOptions = {
  Enums: String,  // enums as string names
  longs: String,  // longs as strings (requires long.js)
  defaults: true, // includes default values
  arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
  objects: true,  // populates empty objects (map fields) even if defaults=false
  oneofs: true    // includes virtual oneof fields set to the present field's name);
};

function BuildNotification(Title, Content, Background, LanguageCode, Platform, Timezone){
  return {
    Id: crypto.randomUUID().toString(),
    Title: Title,
    Content: Content,
    Background: Background,
    LanguageCode: LanguageCode,
    Platform: Platform,
    Unknown1: 1,
    Timezone: Timezone,
    Unknown2: 1
  }
}

const PATCHNOTES_4012026_TEXT = "Welcome to the second round of patchnotes! Most of this is bugfix-focused, and those fixes might not even work yet! Fun!\n\nNew Features:\n- PvE Match Support! This should (theoretically) allow you to take on Hard bots, either solo or CoOp! This still has to be hosted, but we might run some at some point!\n- Randomized map selection, from all available Boundary maps!\n- Proper TDM mode setup, first to 75 kills wins, should last 10 min!\n\nBugfixes:\n- HOPEFULLY fixed the 999/999 spawn bug, though we're gonna have to confirm this in a second to see if I actually fixed it or not!\n- Fixed up the logic server a little bit to make it somewhat more reliable, shouldn't crash as often now\n\nThat's it for today, hope y'all enjoy!"

const PATCHNOTES_3312026_TEXT = "Welcome to the first round of patches for Project Rebound!\nNew Features:\n- Basic emulation of the Logic Server. This allows you to see the news (hi), adjust settings, and not have to reboot the game for every match\n- In-Game Medals & Scoring! Go for those headshots :)\nBugfixes:\n- Fixed several bugs causing respawning early to softlock the game. There is still one more bug I'm working out here, but there should already be improvement here.\n- Upgraded to 128 tick servers! This might get reverted if horrific things happen, but for now enjoy 128tick Boundary!\n- Various optimizations to backend tech, should make your matches significantly more stable!"

const ALPHA_TEXT = "Welcome to the Project Rebound Alpha. Please be patient and respectful to me & your fellow playtesters. Matchmaking will prioritize short queues over full matches, so feel free to coordinate in the discord to get games going."

const PLAYLISTS_JSON = { "PVP": [{ "Name": "Playtest", "Title": [{ "en": "Playtest" }], "Description": [, { "en": "Playtest a very early version of Project Rebound" }], "SecondaryDescription": [{ "en": "Please report any bugs to @systemdev in the Boundary discord" }], "BigTitle": [{ "en": "Playtest" }], "BigDescription": [{ "en": "Playtest a very early version of Project Rebound" }], "PlotImage": [{ "zh": "Capture" }, { "en": "Capture" }], "LargePlotImage": [{ "zh": "Capture" }, { "en": "Capture" }], "GameModeList": ["Purge"], "bHasFilter": false, "bIsLive": true, "Priority": 1, "StartTime": 0, "StopTime": 0 }] };

const TEMP_USER_ID = "76561198211631084"

let PartyPresence = "InMatching";

function BuildRegionList() {
  return [
    { RegionId: matchmakingUDPServerDiscoveryPayload.servers[0].region_id, RegionName: "us-east1" },
    { RegionId: matchmakingUDPServerDiscoveryPayload.servers[1].region_id, RegionName: "asia-east2" },
  ];
}

let fs = require("fs");

const server = net.createServer((socket) => {
  console.log('\n=== Client connected ===');
  console.log(`From: ${socket.remoteAddress}:${socket.remotePort}\n`);

  socket.on('data', (rawdata) => {
    if(rawdata.length == 6 && rawdata.toString("hex") === "000000022f2f"){
      //console.log("[RECV] Keepalive");

      socket.write(rawdata);
      return;
    }

    while(rawdata.length > 0){
      let Length = rawdata.readUint32BE(0);

      let data = rawdata.subarray(0, Length + 4);

      rawdata = rawdata.subarray(4 + Length);

      let Root = protobuf.loadSync("./game/proto/Request/RequestWrapper.proto");

      let RequestWrapperType = Root.lookupType("ProjectBoundary.RequestWrapper");

      let RequestWrapper;
      
      try{
        RequestWrapper = RequestWrapperType.decode(data.subarray(4));
      }
      catch(e){

      }
      
      if(RequestWrapper != undefined){
      let RequestObj = RequestWrapperType.toObject(RequestWrapper, ObjectOptions);

      const MessageId = RequestObj.MessageId;
      const RPCPath = RequestObj.RPCPath;
      const MessageBytes = RequestObj.Message;

      if(RPCPath === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"){
        //console.log("[RECV] Handshake!");

        socket.write(data);
      }
      else if(RPCPath === "/assets.Assets/UpdateRoleArchiveV2"){
        //console.log("[RECV] Update Role Archive V2!");
        
        //console.log(data.toString("hex"));

        Root = protobuf.loadSync("./game/proto/Response/UpdateRoleArchiveV2.proto");

        let UpdateRoleArchiveV2Type = Root.lookupType("ProjectBoundary.UpdateRoleArchiveV2Response");

        let UpdateRoleArchiveV2 = UpdateRoleArchiveV2Type.create({StatusCode: 0});

        let ResponseBytes = UpdateRoleArchiveV2Type.encode(UpdateRoleArchiveV2).finish();

        console.log(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes).toString("hex"));

        socket.write(data);
      }
      else if(RPCPath === "/assets.Assets/UpdateWeaponArchiveV2"){
        //console.log("[RECV] Update Weapon Archive V2!");

        Root = protobuf.loadSync("./game/proto/Response/UpdateRoleArchiveV2.proto");

        let UpdateRoleArchiveV2Type = Root.lookupType("ProjectBoundary.UpdateRoleArchiveV2Response");

        let UpdateRoleArchiveV2 = UpdateRoleArchiveV2Type.create({StatusCode: 0});

        let ResponseBytes = UpdateRoleArchiveV2Type.encode(UpdateRoleArchiveV2).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      /*
      else if(RPCPath === "/assets.Assets/GetPlayerArchiveV2"){
        console.log("[RECV] Player Archive V2!");

        console.log(data.toString("hex"));

        Root = protobuf.loadSync("./game/proto/Request/GetPlayerArchiveV2Request.proto");

        let PlayerArchiveV2RequestType = Root.lookupType("ProjectBoundary.GetPlayerArchiveV2Request");

        let PlayerArchiveV2Request = PlayerArchiveV2RequestType.decode(MessageBytes);

        let PlayerArchiveV2RequestObj = PlayerArchiveV2RequestType.toObject(PlayerArchiveV2Request, ObjectOptions);

        let ResponseObj = {PlayerRoleDatas: [], PlayerLevel: 0};

        for(let RoleID of PlayerArchiveV2RequestObj.RoleIDs){
          console.log(RoleID);

          ResponseObj.PlayerRoleDatas.push({
            RoleID: RoleID,
            LeftPylon: "None",
            RightPylon: "None",
            MobilityModule: "None",
            MeleeWeapon: "None",
            PrimaryWeapon: "None",
            SecondaryWeapon: "None"
          });
        }

        Root = protobuf.loadSync("./game/proto/Response/GetPlayerArchiveV2Response.proto");

        let PlayerArchiveV2ResponseType = Root.lookupType("ProjectBoundary.GetPlayerArchiveV2Response");

        let PlayerArchiveV2Response = PlayerArchiveV2ResponseType.create(ResponseObj);

        let ResponseBytes = PlayerArchiveV2ResponseType.encode(PlayerArchiveV2Response).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      /*
      else if(RPCPath === "/assets.Assets/QueryAssets"){
        console.log("[RECV] Query Assets!");

        Root = protobuf.loadSync("./game/proto/Response/QueryAssetsResponse.proto");

        let QueryAssetsResponseType = Root.lookupType("ProjectBoundary.QueryAssetsResponse");

        let ResponseObj = {ItemDatas: []};
        
        for(let item of Object.keys(JSON.parse(fs.readFileSync("./game/definitions/DT_ItemType.json", "utf8"))[0]["Rows"])){
          if(item == "PEACE_RU-AKM"){
            ResponseObj.ItemDatas.push({
            ItemId: item,
            Unknown1: 1,
            Unknown2: 1,
            Unknown3: 1
          });
          }

          
        }

        ResponseObj.ItemCount = 0;

        let QueryAssetsResponse = QueryAssetsResponseType.create(ResponseObj);

        let ResponseBytes = QueryAssetsResponseType.encode(QueryAssetsResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      */
      else if(RPCPath === "/notification.Notification/QueryNotification"){
        //console.log("[RECV] Query Notification!");

        Root = protobuf.loadSync("./game/proto/Request/QueryNotificationRequest.proto");

        let QueryNotificationRequestType = Root.lookupType("ProjectBoundary.QueryNotificationRequest");

        let QueryNotificationRequest = QueryNotificationRequestType.decode(MessageBytes);

        let QueryNotificationRequestObj = QueryNotificationRequestType.toObject(QueryNotificationRequest, ObjectOptions);

        const Platform = QueryNotificationRequestObj.Platform;

        const LanguageCode = QueryNotificationRequestObj.LanguageCode;

        // translate it or smth idfk

        Root = protobuf.loadSync("./game/proto/Response/QueryNotificationResponse.proto");

        let QueryNotificationResponseType = Root.lookupType("ProjectBoundary.QueryNotificationResponse");

        let QueryNotificationResponse = QueryNotificationResponseType.create({Unknown: 0, Notifications: [BuildNotification("4/01/2026 Patchnotes", PATCHNOTES_4012026_TEXT, "", LanguageCode, Platform, "America/New_York"), BuildNotification("3/31/2026 Patchnotes", PATCHNOTES_3312026_TEXT, "", LanguageCode, Platform, "America/New_York"), BuildNotification("Project Rebound Alpha", ALPHA_TEXT, "", LanguageCode, Platform, "America/New_York")]});

        let ResponseBytes = QueryNotificationResponseType.encode(QueryNotificationResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/party.party/Create"){
        //console.log("[RECV] Party Create!");
        
        Root = protobuf.loadSync("./game/proto/Response/CreatePartyResponse.proto");

        let CreatePartyResponseType = Root.lookupType("ProjectBoundary.CreatePartyResponse");

        let CreatePartyResponse = CreatePartyResponseType.create({StatusCode: 0, PartyId: crypto.randomUUID().toString(), PartyMembers: [TEMP_USER_ID]});

        let ResponseBytes = CreatePartyResponseType.encode(CreatePartyResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/party.party/Ready"){
        //console.log("[RECV] Party Ready!");

        Root = protobuf.loadSync("./game/proto/Request/PartyReadyRequest.proto");

        let PartyReadyRequestType = Root.lookupType("ProjectBoundary.PartyReadyRequest");

        let PartyReadyRequest = PartyReadyRequestType.decode(MessageBytes);

        let PartyReadyRequestObj = PartyReadyRequestType.toObject(PartyReadyRequest, ObjectOptions);

        const PartyId = PartyReadyRequestObj.PartyId;
        
        Root = protobuf.loadSync("./game/proto/Response/PartyReadyResponse.proto");

        let PartyReadyResponseType = Root.lookupType("ProjectBoundary.PartyReadyResponse");

        let PartyReadyResponse = PartyReadyResponseType.create({StatusCode: 0});

        let ResponseBytes = PartyReadyResponseType.encode(PartyReadyResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/party.party/Get"){
        //console.log("[RECV] Get Party!");
      }
      else if(RPCPath === "/chat.chat/TextFilter"){
        //console.log("[RECV] Text Filter!");
      }
      else if(RPCPath === "/party.party/SetPresence"){
        //console.log("[RECV] Set Party Presence!");
        
        Root = protobuf.loadSync("./game/proto/Request/SetPartyPresenceRequest.proto");

        let SetPartyPresenceRequestType = Root.lookupType("ProjectBoundary.SetPartyPresenceRequest");

        let SetPartyPresenceRequest = SetPartyPresenceRequestType.decode(MessageBytes);

        let SetPartyPresenceRequestObj = SetPartyPresenceRequestType.toObject(SetPartyPresenceRequest, ObjectOptions);

        const DecodedPartyPresence = SetPartyPresenceRequestObj.Presence;

        console.log(`[PARTY] Presence ${PartyPresence} => ${DecodedPartyPresence}`);

        PartyPresence = DecodedPartyPresence;

        Root = protobuf.loadSync("./game/proto/Response/SetPartyPresenceResponse.proto");

        let SetPartyPresenceResponseType = Root.lookupType("ProjectBoundary.SetPartyPresenceResponse");

        let SetPartyPresenceResponse = SetPartyPresenceResponseType.create({StatusCode: 0});

        let ResponseBytes = SetPartyPresenceResponseType.encode(SetPartyPresenceResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/party.party/QueryPresence"){
        //console.log("[RECV] Query Party Presence!");

        Root = protobuf.loadSync("./game/proto/Response/QueryPartyPresenceResponse.proto");

        let QueryPartyPresenceResponseType = Root.lookupType("ProjectBoundary.QueryPartyPresenceResponse");

        let QueryPartyPresenceResponse = QueryPartyPresenceResponseType.create({StatusCode: 0, PartyMembers: [{
          UserId: TEMP_USER_ID,
          Status: PartyPresence
        }]});

        let ResponseBytes = QueryPartyPresenceResponseType.encode(QueryPartyPresenceResponse).finish();

        //console.log(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes).toString("hex"));

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/matchmaking.Matchmaking/QueryUnityMatchmakingRegion"){
        console.log("[RECV] Query Matchmaking Region!");

        Root = protobuf.loadSync("./game/proto/Response/QueryMatchmakingRegionResponse.proto");

        let QueryMatchmakingRegionResponseType = Root.lookupType("ProjectBoundary.QueryMatchmakingRegionResponse");

        let QueryMatchmakingRegionResponse = QueryMatchmakingRegionResponseType.create({StatusCode: 0, Regions: BuildRegionList()});

        let ResponseBytes = QueryMatchmakingRegionResponseType.encode(QueryMatchmakingRegionResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/matchmaking.Matchmaking/StartUnityMatchmaking"){
        console.log("[RECV] Start Matchmaking!");

        //console.log(data.toString("hex"));

        Root = protobuf.loadSync("./game/proto/Request/StartMatchmakingRequest.proto");

        let StartMatchmakingRequestType = Root.lookupType("ProjectBoundary.StartMatchmakingRequest");

        let StartMatchmakingRequest = StartMatchmakingRequestType.decode(MessageBytes);

        let StartMatchmakingRequestObj = StartMatchmakingRequestType.toObject(StartMatchmakingRequest, ObjectOptions);

        const UserIdToMatchmake = StartMatchmakingRequestObj.Payload.MatchmakingRequestorUserId;

        // should probably validate that someday

        Root = protobuf.loadSync("./game/proto/Response/StartMatchmakingResponse.proto");

        let StartMatchmakingResponseType = Root.lookupType("ProjectBoundary.StartMatchmakingResponse");

        let StartMatchmakingResponse = StartMatchmakingResponseType.create({StatusCode: 0});

        let ResponseBytes = StartMatchmakingResponseType.encode(StartMatchmakingResponse).finish();
        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/playerdata.PlayerDataClient/GetDataStatisticsInfo"){
        //console.log("[RECV] Get Data Statistics!");

        Root = protobuf.loadSync("./game/proto/Response/GetDataStatisticsInfoResponse.proto");

        let GetDataStatisticsInfoResponseType = Root.lookupType("ProjectBoundary.GetDataStatisticsInfoResponse");

        let GetDataStatisticsInfoResponse = GetDataStatisticsInfoResponseType.create({StatusCode: 0, Datapoints: []});

        let ResponseBytes = GetDataStatisticsInfoResponseType.encode(GetDataStatisticsInfoResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/matchmaking.Matchmaking/QueryPlayList"){
        console.log("[RECV] Query Playlists!");

        Root = protobuf.loadSync("./game/proto/Response/QueryPlaylistResponse.proto");

        let QueryPlaylistResponseType = Root.lookupType("ProjectBoundary.QueryPlaylistResponse");

        let QueryPlaylistResponse = QueryPlaylistResponseType.create({StatusCode: 0, PlaylistsJSON: JSON.stringify(PLAYLISTS_JSON)});

        let ResponseBytes = QueryPlaylistResponseType.encode(QueryPlaylistResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else if(RPCPath === "/profile.Profile/QueryCurrency"){
        //console.log("[RECV] Query Currency!");

        Root = protobuf.loadSync("./game/proto/Response/QueryCurrencyResponse.proto");

        let QueryCurrencyResponseType = Root.lookupType("ProjectBoundary.QueryCurrencyResponse");

        let QueryCurrencyResponse = QueryCurrencyResponseType.create({CurrencyA: 0, CurrencyB: 0, CurrencyC: 0, CurrencyD: 0, CurrencyE: 0});

        let ResponseBytes = QueryCurrencyResponseType.encode(QueryCurrencyResponse).finish();

        socket.write(WrapMessageAndSerialize(MessageId, RPCPath, ResponseBytes));
      }
      else{
        console.log("[RECV] Undefined Message:\n", {
          path: RequestObj.RPCPath,
          MessageId: RequestObj.MessageId
        });

        //socket.write(data);
      }
    }
    }
    


  });

  socket.on('end', () => {
    console.log('\n=== Client disconnected ===\n');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

let udp = require("dgram");
const { serialize } = require('v8');

const matchmakingUDPServer = udp.createSocket('udp4');

matchmakingUDPServer.on("error", (error) => {
  console.log("[MM] Server blew up!");
  console.log(error.toString());
  matchmakingUDPServer.close();
});

matchmakingUDPServer.on("close", () => {
  console.log("[MM] Shutdown!");
});

matchmakingUDPServer.on("message", (message, info) => {
  if(message[0] == 0x59){
    console.log("[MM] Recieved a new QoS message, echoing!");
    
    let header = Buffer.alloc(3);

    header[0] = 0x95;
    header[1] = 0x00;

    const resp = Buffer.concat([header, message.subarray(11)]);

    matchmakingUDPServer.send(resp, info.port, info.address, (error, bytesSend) => {
      console.log("Sent Info\n", {
        error: error,
        bytesSent: bytesSend,
        addr: info.address,
        port: info.port,
        req: message.toString("hex"),
        resp: resp.toString("hex")
      });
    });
  }
  else{
    console.log("[MM] Recv'd an unknown message!");
    console.log(message);
  }
});

matchmakingUDPServer.on("listening", () => {
  console.log(`mrooooow >.< - ${9000}`);
});

const matchmakingTCPServer = net.createServer((socket) => {
  console.log('\n=== Client connected ===');
  console.log(`From: ${socket.remoteAddress}:${socket.remotePort}\n`);

  socket.on('data', (rawdata) => {
    console.log("MOGGEDDDDDDDDD");
  });
});

app.listen(process.env.PORT || 8000, () => {
    console.log(`mrow :3 - ${process.env.PORT || 8000}`);

    server.listen(6969, () => {
      console.log(`miau >:3 - ${6969}`);

      matchmakingUDPServer.bind(9000);

      matchmakingTCPServer.listen(9000);
    })
});
