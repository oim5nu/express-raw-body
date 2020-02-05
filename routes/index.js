var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var _ = require('lodash');
var axios = require('axios');


async function validateCallback(req, res, next) {
  console.log('req.rawBody', req.rawBody);
  const xSignature = _.get(req, ['headers', 'x-content-signature']);
  const keyUrl = _.get(req, ['body', 'Metadata', 'key_url']);
  console.log('keyUrl', keyUrl);
  if (!xSignature || !keyUrl || !req.rawBody) {
    return res.status(404).json({ error: 'Invalid Operation!'})
  }
  const result = await axios.get(keyUrl);
  console.log('result.data.signing_key', result.data.signing_key);

  const hash = crypto.createHash('sha256')
    .update(result.data.signing_key, "utf8")
    .digest('base64');
  const computedSignature = crypto.createHmac('sha256', Buffer.from(hash, 'base64'))
    .update(req.rawBody, "utf8")
    .digest('base64');
    
  console.log('computedSignature', computedSignature);
  console.log('x-content-signature', xSignature);
  //console.log('result.signing_key', result.signing_key);
  if(computedSignature === xSignature) {
    next();
  } else {
    res.status(403).json({error: 'Failure validation'});
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/callbacks', validateCallback, async function(req, res, next) {

  res.status(200).json({ payload: req.body });
});

module.exports = router;
