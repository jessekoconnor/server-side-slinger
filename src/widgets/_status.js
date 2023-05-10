console.log('file loaded')
exports.lambdaHandler = () => ({
    statusCode: 200,
    body: JSON.stringify({
        message: 'hello world',
    }),
});
exports.functionName = 'Status';
