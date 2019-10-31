const Koa = require('koa');

const cors = require('koa2-cors');

// const bodyParser = require('koa-bodyparser');

const koaBody = require('koa-body');



const controller = require('./controller');
const sql = require('mssql');

const serve = require("koa-static");






const app = new Koa();

sql.connect('mssql://YJSMD_Login:YJS@123@192.168.0.38/ceshi');
// sql.connect('mssql://YJSMD_Login:YJS@123@192.168.0.38/my20181225');

app.use(koaBody({
    multipart: true
    ,
    formidable: {
        maxFileSize: 200 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
    }
})).use(serve(__dirname))
    .use(cors())

    // .use(bodyParser({
    //     formLimit:"20mb",
    //     jsonLimit:"20mb",
    //     textLimit:"20mb",
    //     enableTypes: ['json', 'form', 'text']
    // }))

    .use(controller())
    // 设置静态文件
    ;
app.listen(3003);