const {parseAuth, addNativeCreditSymbol} = require('./utils');
async function runActionsWithAuth(api, authorization, actions){
  const auth  = parseAuth(authorization);


  const result = await api.transact({
    actions: actions.map(x=>({...x, authorization: auth}))
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  

}
async function createAccountWithResources(api, authorization, creator, accountName, ownerPublicKey, activePublicKey, {ramBytes, stakeNet, stakeCpu, transfer, from}={}){

  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zswhq',
      name: 'newaccount',
      authorization:auth,
      data: {
        "creator": creator || auth[0].actor,
        "name": accountName,
        "owner": {
          "threshold": 1,
          "keys": [
            {
              "key": ownerPublicKey,
              "weight": 1
            }
          ],
          "accounts": [],
          "waits": []
        },
        "active": {
          "threshold": 1,
          "keys": [
            {
              "key": activePublicKey,
              "weight": 1
            }
          ],
          "accounts": [],
          "waits": []
        }
      },
    },
  ];
  if(ramBytes){
    actions.push({
      account: 'zswhq',
      name: 'buyrambytes',
      authorization:auth,
      data: {"payer": from || creator || auth[0].actor,"receiver":accountName,"bytes":ramBytes},
    })
  }
  if(stakeNet||stakeCpu){
    actions.push({
      account: 'zswhq',
      name: 'delegatebw',
      authorization:auth,
      data: {

        "from": from || creator || auth[0].actor,
        "receiver": accountName,
        "stake_net_quantity": addNativeCreditSymbol(stakeNet),
        "stake_cpu_quantity": addNativeCreditSymbol(stakeCpu),
        "transfer": !!transfer
      },
    })
  }

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}
async function makeIssuer(api, authorization, {authorizer, issuerName, zswId, altId, permissions, status}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'mkissuer',
      authorization:auth,
      data: {
        authorizer,
        issuer_name: issuerName,
        zsw_id: zswId,
        alt_id: altId,
        permissions,
        status,
      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}
async function makeRoyaltyReceiverUser(api, authorization, {authorizer, royaltyReceiverUserName, zswId, altId, status}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'mkroyaltyusr',
      authorization:auth,
      data: {
        authorizer,
        zsw_id: zswId,
        newroyaltyusr: royaltyReceiverUserName,
        alt_id: altId,
        status,
      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}
async function makeSchema(api, authorization, {authorizer, creator, schemaName, schemaFormat}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'mkschema',
      authorization:auth,
      data: {
        authorizer,
        creator,
        schema_name: schemaName,
        schema_format: schemaFormat,
      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}
async function makeCollection(api, authorization, {authorizer, creator, issuing_platform, collection_id, zsw_code, collection_type, item_config, secondary_market_fee, primary_market_fee, schema_name, external_metadata_url, royalty_fee_collector, notify_accounts, authorized_accounts, metadata}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'mkcollection',
      authorization:auth,
      data: {
        authorizer: authorizer,
        creator: creator,
        issuing_platform: issuing_platform,
        collection_id: collection_id,
        zsw_code: zsw_code,
        collection_type: collection_type,
        item_config: item_config,
        secondary_market_fee: secondary_market_fee,
        primary_market_fee: primary_market_fee,
        schema_name: schema_name,
        external_metadata_url: external_metadata_url,
        royalty_fee_collector: royalty_fee_collector,
        notify_accounts: notify_accounts,
        authorized_accounts: authorized_accounts,
        metadata: metadata,
      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}


async function makeItem(api, authorization, {authorizer, creator, ram_payer, item_id, zsw_code, item_config, collection_id, max_supply, item_type, external_metadata_url, schema_name, metadata}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'mkitem',
      authorization:auth,
      data: {        
        authorizer: authorizer,
        creator: creator,
        ram_payer: ram_payer,
        item_id: item_id,
        zsw_code: zsw_code,
        item_config: item_config,
        collection_id: collection_id,
        max_supply: max_supply,
        item_type: item_type,
        external_metadata_url: external_metadata_url,
        schema_name: schema_name,
        metadata: metadata,

      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}


async function transferItems(api, authorization, {authorizer, from, to, item_ids, amounts, memo}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'transfer',
      authorization:auth,
      data: {
        authorizer, from, to, item_ids: item_ids, amounts, memo
      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}
async function mintItems(api, authorization, {minter, to, item_ids, amounts, memo}){
  const auth  = parseAuth(authorization);
  const actions = [
    {
      account: 'zsw.items',
      name: 'mint',
      authorization:auth,
      data: {
        minter, to, item_ids: item_ids, amounts, memo
      },
    }
  ];

  const result = await api.transact({
    actions,
  },
  {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result;
}

module.exports = {
  makeIssuer,
  makeCollection,
  makeItem,
  makeRoyaltyReceiverUser,
  makeSchema,
  mintItems,
  transferItems,
  createAccountWithResources,
  runActionsWithAuth,
  
}