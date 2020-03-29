const https = require("https");
const { EventEmitter } = require('events');
const event = new EventEmitter();
const config = require('./config');

const option = {
    method: 'POST',
    headers: {
        Cookie: `SESSION=${config.UserConfig.SESSION}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    host: 'student.wozaixiaoyuan.com',
}

function obj2url(obj) {
    let ret = [];
    for (let i in obj) {
        let r = encodeURI(obj[i]);
        ret.push(`${i}=${r}`);
    }
    return ret.join('&');
}

function getSignMessage() {
    let data = 'page=1';
    option.path = '/sign/getSignMessage.json';
    let req = https.request(option, res => {
        res.setEncoding('utf8');
        let raw = '';
        res.on('readable', () => {
            let chunk;
            while (null !== (chunk = res.read())) {
                raw += chunk;
            }
        });
        res.on('end', () => {
            let json_raw = JSON.parse(raw);
            event.emit('getSignMessage_finish', json_raw);
        })
    });
    req.on('error', (e) => {
        console.error(`request error: ${e.message}`);
        event.emit('error', `getSignMessage Error : ${e.message}`);
    });
    req.write(data);
    req.end();
}

function getHealthToday() {
    option.path = '/health/getToday.json';
    let req = https.request(option, res => {
        res.setEncoding('utf8');
        res.on('readable', () => {
            let chunk;
            while (null !== (chunk = res.read())) {
                console.log(chunk);
            }
        })
    });
    req.end();
}

function autoSignHealthToday() {
    option.path = '/health/save.json';
    let req = https.request(option, res => {
        res.setEncoding('utf8');
        res.on('readable', () => {
            let chunk;
            while (null !== (chunk = res.read())) {
                console.log(chunk);
            }
        })
        console.log(res.statusCode);
    });
    req.write(obj2url(config.SignConfig));
    req.end();
}

// todo
function autoGpsSign(id) {
    option.path = '/sign/doSign.json';
    let req = https.request(option, res => {
        res.setEncoding('utf8');
        let all_raw = '';
        res.on('readable', () => {
            let chunk;
            while (null !== (chunk = res.read())) {
                all_raw += chunk;
            }
        });
        res.on('end', () => {
            event.emit('success', `autoGpsSign OK: ${all_raw}`);
        });
        //console.log(res.statusCode);
    });

    req.write(`id=${id}&` + obj2url(config.SignConfig) + '&key=daf62d4cce9ebe2a57b21452323b24ed&timestamp=1585116341000');
    req.on('error', e => {
        event.emit('error', `autoGpsSign Error : ${e.message}`);
    });
    req.end();
}


event.on('getSignMessage_finish', data => {
    //console.log(data);
    let id = data.data[0].logId;
    //163281870929821797
    console.log(`开始签到 id: ${id}`);
    autoGpsSign(id);
});

event.once('error', data => {
    //sendToWeChat('wzxy sign Error', data);
});

event.once('success', data => {
    //sendToWeChat('wzxy sign OK', data);
})

getSignMessage();
autoSignHealthToday();