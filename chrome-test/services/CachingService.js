'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;
const createResponse = (statusCode, body) => ({ statusCode, body });
const disableCache = process.env.DISABLE_WIDGET_CACHE === 'true';

function oneDayYoung(date) {
    const oneday = 60 * 60 * 24 * 1000;
    // const oneday = 0;
    if(new Date().getTime() - date.getTime() > oneday) {
        return false;
    }
    return true;
}

exports.getWidget = async(id) => {
    try {
        // Disable cache if parameter override
        if(disableCache) {
            console.log('CACHING IS DISABLED, RETURNING', disableCache);
            return;
        }

        let res = await exports.get(id);

        // Check created date for validity
        if(res && res.created) {
            let cacheDate = new Date(res.created);
            res.doc = JSON.parse(res.doc);
            res.isValid = oneDayYoung(cacheDate);
        }

        return res;
    } catch(err) {
        console.log(`GET WIDGET FAILED FOR id = ${id}, WITH ERROR: ${err}`);
        return err;
    }
};

exports.get = async (id) => {
    try {
        let params = {
            TableName: tableName,
            Key: {
                id: id
            }
        };

        let data = await dynamo.get(params).promise();
        // console.log('*** Success Response from Dynamo*****', Object.keys(data));
        return data.Item;
    } catch (err) {
        console.log(`GET ITEM FAILED FOR doc = ${params.Key.id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }
};

function put(params) {
    return new Promise((res, rej) => {
        dynamo.put(params, function(err, data) {
                if (err) rej(err);
                else res(data);
            });
    });
}

exports.put = async (id, document) => {
    let item = {
        id: id,
        doc: JSON.stringify(document),
        created: new Date().toString()
    }, params = {
        TableName: tableName,
        Item: item
    };

    try {
        await put(params);
        console.log(`PUT ITEM SUCCEEDED WITH doc = ${item.id}`);
        return createResponse(200, null);
    } catch(err) {
        console.log(`PUT ITEM FAILED FOR doc = ${item.doc}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }
};

// exports.delete = (event, context, callback) => {
//
//     let params = {
//         TableName: tableName,
//         Key: {
//             id: event.pathParameters.resourceId
//         },
//         ReturnValues: 'ALL_OLD'
//     };
//
//     let dbDelete = (params) => { return dynamo.delete(params).promise() };
//
//     dbDelete(params).then( (data) => {
//         if (!data.Attributes) {
//             callback(null, createResponse(404, "ITEM NOT FOUND FOR DELETION"));
//             return;
//         }
//         console.log(`DELETED ITEM SUCCESSFULLY WITH id = ${event.pathParameters.resourceId}`);
//         callback(null, createResponse(200, null));
//     }).catch( (err) => {
//         console.log(`DELETE ITEM FAILED FOR id = ${event.pathParameters.resourceId}, WITH ERROR: ${err}`);
//         callback(null, createResponse(500, err));
//     });
// };