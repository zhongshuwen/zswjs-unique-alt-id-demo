const { Api, JsonRpc } = require("zswjs");
const { JsSignatureProvider, PrivateKey } = require('zswjs/dist/zswjs-jssig');      // development only

const { TextEncoder, TextDecoder } = require('util');
const fetch = require('node-fetch');
const { createAccountWithResources, runActionsWithAuth } = require("./tx");
const { privateToPublic, uuidToZsw64BitId, uuidToUint256Id } = require("./utils");
const { randomBytes } = require("crypto");
const { BN } = require("bn.js");
const getRandomUUIDV4 = require("uuid").v4;
const API_URL = "http://127.0.0.1:3031";
function getItemIdSerialNumber(altIdNumber){
  const randHex = randomBytes(8).toString('hex');
  const id40Bit = parseInt(randHex.substring(6),16)+"";
  const zswId = new BN(altIdNumber.toString(16)+randHex,16).toString();
  return {
    id40Bit,
    zswId,
  }
}
function sleep(ms){
  return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function runMain() {
  const rpc = new JsonRpc(API_URL, { fetch });
  const ZSW_ADMIN_PRIVATE_KEY = 'PVT_GM_FubzkuGf4puzpbmtjr2kRzQtXzpbmMBKM8q6oXRCSNmHzH5Cd'; // use the one in your docker-compose


  const adminKexinJieDianAccounts = [
    {
      'account': 'zhongshuwen1',
      'privateKeyOwner': 'PVT_GM_wwJyadYskjbFuz7VtWYZApapUUsphZfuqkjZeVZKRUowFoZxZ',
      'privateKeyActive': 'PVT_GM_B7ZWJ5QmvVhMZHzvTQFk7CcSwrm71Hchu6pjzLniGnxhBFXM9',
      'userUuid': getRandomUUIDV4(),
    },
  ]
  const kexinJieDianAccounts = [
    {
      'account': 'kxjdtest111a',
      'privateKeyOwner': 'PVT_GM_wwJyadYskjbFuz7VtWYZApapUUsphZfuqkjZeVZKRUowFoZxZ',
      'privateKeyActive': 'PVT_GM_B7ZWJ5QmvVhMZHzvTQFk7CcSwrm71Hchu6pjzLniGnxhBFXM9',
      'userUuid': getRandomUUIDV4(),
    },
  ]
  const userAccounts = [
    {
      'account': 'usertest111a',
      'privateKeyOwner': 'PVT_GM_wwJyadYskjbFuz7VtWYZApapUUsphZfuqkjZeVZKRUowFoZxZ',
      'privateKeyActive': 'PVT_GM_B7ZWJ5QmvVhMZHzvTQFk7CcSwrm71Hchu6pjzLniGnxhBFXM9',
      'userUuid': getRandomUUIDV4(),
    },
    {
      'account': 'usertest111b',
      'privateKeyOwner': 'PVT_GM_kQ2Ncxp9zvt4HAbcc1uCuF7aMNTfZzqeJMuXJJTCd7qfNjoSc',
      'privateKeyActive': 'PVT_GM_AuAnBNQNxkXCLFfyTJvvfsN3K2CwQnSiFEhVtDuFrBMkfMVGU',
      'userUuid': getRandomUUIDV4(),
    },
    {
      'account': 'usertest111c',
      'privateKeyOwner': 'PVT_GM_2LFqQ8jHx953hfKPRu1od5fKgjB5NQs7g1TZf8zFX1aX9MT4Kc',
      'privateKeyActive': 'PVT_GM_bazGYMcyP8n8dnHSdoNVtPiXk4X7vrC7mMpUemWSYYf75dvzY',
      'userUuid': getRandomUUIDV4(),
    },
  ];
  const newPrivKeys = kexinJieDianAccounts.map(x => [x.privateKeyOwner, x.privateKeyActive]).concat(adminKexinJieDianAccounts.map(x => [x.privateKeyOwner, x.privateKeyActive])).concat(userAccounts.map(x => [x.privateKeyOwner, x.privateKeyActive])).reduce((a, b) => a.concat(b));


  const PRIVATE_KEYS = [
    ZSW_ADMIN_PRIVATE_KEY,
  ].concat(newPrivKeys)

  const api = new Api({
    rpc: rpc,
    signatureProvider: new JsSignatureProvider(PRIVATE_KEYS),
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  
  for (let acc of adminKexinJieDianAccounts) {
    await createAccountWithResources(api, 'zsw.admin@active', 'zsw.admin', acc.account, privateToPublic(acc.privateKeyOwner), privateToPublic(acc.privateKeyActive), { ramBytes: 1000000, stakeCpu: 100000, stakeNet: 5000, transfer: false });
    await sleep(3000);

    runActionsWithAuth(api, 'zsw.admin@active', [
      {
        "account": "zsw.items",
        "name": "mkissuer",
        "data": {
          "authorizer": "zsw.admin",
          "issuer_name": acc.account,
          "zsw_id": uuidToUint256Id(acc.userUuid),
          "alt_id": 0,
          "permissions": 1001375,
          "status": 0
        }
      },
      {
        "account": "zsw.items",
        "name": "setuserperms",
        "data": {
          "sender": "zsw.admin",
          "user": acc.account,
          "permissions": "1001375"
        }
      },
      {
        "account":"zsw.items",
        "name":"setcustperms",
        "data":{
          "sender": "zsw.admin",
          "custodian": acc.account,
          "permissions": 223
        }
      },
      {
        "account": "zsw.perms",
        "name": "setperms",
        "data": {
          "sender": "zsw.admin",
          "scope": "zsw.prmcore",
          "user": acc.account,
          "perm_bits": 65512
        }
      },
      {
        "account": "zswhq.token",
        "name": "transfer",
        "data": {
          "from": "zsw.admin",
          "to":acc.account,
          "quantity": "1000000.0000 ZSWCC",
          "memo": ""
        }
      }
    ])
  }
  for (let acc of kexinJieDianAccounts) {
    await createAccountWithResources(api, 'zsw.admin@active', 'zsw.admin', acc.account, privateToPublic(acc.privateKeyOwner), privateToPublic(acc.privateKeyActive), { ramBytes: 1000000, stakeCpu: 100000, stakeNet: 5000, transfer: false });
    await sleep(3000);
    
    runActionsWithAuth(api, 'zsw.admin@active', [
      {
        "account": "zsw.items",
        "name": "mkcustodian",
        "data": {
          "creator": "zsw.admin",
          "custodian_name": acc.account,
          "zsw_id": uuidToUint256Id(acc.userUuid),
          "alt_id": 0,
          "permissions": 147,
          "status": 0,
          "incoming_freeze_period": 1440,
          "notify_accounts": [acc.account]
        }
      },
      {
        "account": "zsw.items",
        "name": "mkissuer",
        "data": {
          "authorizer": "zsw.admin",
          "issuer_name": acc.account,
          "zsw_id": uuidToUint256Id(acc.userUuid),
          "alt_id": 0,
          "permissions": 524304,
          "status": 0
        }
      },
      {
        "account": "zsw.perms",
        "name": "setperms",
        "data": {
          "sender": "zsw.admin",
          "scope": "zsw.prmcore",
          "user": acc.account,
          "perm_bits": 24576
        }
      },
      {
        "account": "zsw.items",
        "name": "mkroyaltyusr",
        "data": {
          "authorizer": "zsw.admin",
          "newroyaltyusr": acc.account,
          "zsw_id": uuidToUint256Id(acc.userUuid),
          "alt_id": 0,
          "status": 0
        }
      }
    ])
  }
  for (let acc of userAccounts) {
    await createAccountWithResources(api, 'zsw.admin@active', 'zsw.admin', acc.account, privateToPublic(acc.privateKeyOwner), privateToPublic(acc.privateKeyActive), { ramBytes: 3000 });
  }

  await runActionsWithAuth(api, 'zhongshuwen1@active', [
    {
      "account": "zsw.items",
      "name": "mkschema",
      "data": {
        "authorizer": "zhongshuwen1",
        "creator": "zhongshuwen1",
        "schema_name": "collection11",
        "schema_format": [
          {
            "type": "string",
            "name": "name"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "website"
          },
          {
            "type": "string",
            "name": "thumbnail_url"
          },
          {
            "type": "string",
            "name": "logo_url"
          },
          {
            "type": "string",
            "name": "banner_url"
          },
          {
            "type": "string",
            "name": "featured_image_url"
          }
        ]
      }
    },
    {
      "account": "zsw.items",
      "name": "mkschema",
      "data": {
        "authorizer": "zhongshuwen1",
        "creator": "zhongshuwen1",
        "schema_name": "item11111111",
        "schema_format": [
          {
              "type": "string",
              "name": "name"
          },
          {
              "type": "string",
              "name": "description"
          },
          {
              "type": "string",
              "name": "asset_url"
          },
          {
              "type": "string",
              "name": "content_type"
          },
          {
              "type": "string",
              "name": "thumbnail_url"
          }
        ]
      }
    }
  ])
  await sleep(3000);

  let curKxjdName=kexinJieDianAccounts[0].account;
  const collectionAUUID = getRandomUUIDV4();

  await runActionsWithAuth(api, `zhongshuwen1@active,${curKxjdName}@active`, [
    {
      "account": "zsw.items",
      "name": "mkcollection",
      "data": {
        authorizer: 'zhongshuwen1',
        zsw_id: uuidToUint256Id(collectionAUUID),
        collection_id: uuidToZsw64BitId(collectionAUUID),
        collection_type: 0,
        creator: curKxjdName,
        issuing_platform: curKxjdName,
        item_config: 11,
        secondary_market_fee: 1,
        primary_market_fee: 1,
        royalty_fee_collector: curKxjdName,
        max_supply: "18446744073709551615",
        max_items: "4294967295",
        max_supply_per_item: "18446744073709551615",
        schema_name: "collection11",
        authorized_minters: [curKxjdName],
        notify_accounts: [curKxjdName],
        authorized_mutable_data_editors: [],
        "metadata": [
          { "key": "name", "value": ["string", "Cool Collection"] },
          { "key": "description", "value": ["string", "This is a great collection!"] },
          { "key": "website", "value": ["string", "https://zhongshuwen.com"] },
          { "key": "thumbnail_url", "value": ["string", "https://zhongshuwen.com/thumbnail.png"] },
          { "key": "logo_url", "value": ["string", "https://zhongshuwen.com/logo.png"] },
          { "key": "banner_url", "value": ["string", "https://zhongshuwen.com/banner.png"] },
          { "key": "featured_image_url", "value": ["string", "https://zhongshuwen.com/featured_image.png"] },
        ],
        external_metadata_url: "",
      }
    }
  ])


  await sleep(3000);
  const itemTemplateAUUID = getRandomUUIDV4();


  const maxAltId = 10000;
  await runActionsWithAuth(api, `zhongshuwen1@active,${curKxjdName}@active`, [
    {
      "account": "zsw.items",
      "name": "mkitemtpl",
      "data": {
        authorizer: 'zhongshuwen1',
        creator: curKxjdName,
        zsw_id: uuidToUint256Id(itemTemplateAUUID),
        item_template_id: uuidToZsw64BitId(itemTemplateAUUID),
        collection_id: uuidToZsw64BitId(collectionAUUID),
        item_type: ((1 << 0) | (1 << 2) | ((maxAltId << 12)))>>>0,
        schema_name: "item11111111",
        authorized_mutable_data_editors: [],
        "immutable_metadata": [
          { "key": "name", "value": ["string", "Cool Item"] },
          { "key": "description", "value": ["string", "This is a great item!"] },
          { "key": "asset_url", "value": ["string", "https://zhongshuwen.com/asset.png"] },
          { "key": "content_type", "value": ["string", "image/*"] },
          { "key": "thumbnail_url", "value": ["string", "https://zhongshuwen.com/asset_thumbnail.png"] },
        ],
        item_external_metadata_url_template: "",
      }
    }
  ])
  await sleep(3000);

  const itemAIdInfo = getItemIdSerialNumber(1337);


  await runActionsWithAuth(api, `zhongshuwen1@active,${curKxjdName}@active`, [
    {
      "account": "zsw.items",
      "name": "mkitem",
      "data": {
        authorizer: 'zhongshuwen1',
        authorized_minter: curKxjdName,
        item_id: itemAIdInfo.id40Bit,
        zsw_id: itemAIdInfo.zswId,
        item_config: 11,
        item_template_id: uuidToZsw64BitId(itemTemplateAUUID),
        max_supply: 1,
        schema_name: "item11111111",
        immutable_metadata: [],
        mutable_metadata: [],
      }
    }
  ])
  await sleep(3000);
  await runActionsWithAuth(api, `${curKxjdName}@active`, [
    {
      "account": "zsw.items",
      "name": "mint",
      "data": {
        minter: curKxjdName,
        to: userAccounts[0].account,
        to_custodian: curKxjdName,
        item_ids: ["206303249718"],//[itemAIdInfo.id40Bit],
        amounts: [1],
        memo: "here is your item!",
        freeze_time: 60,
      }
    },
  ])
}

runMain().catch(err => console.error("FATAL ERROR: ", err));
