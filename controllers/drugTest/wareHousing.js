const sql = require('mssql')
const formidable = require('koa-formidable'); // 图片处理
const fs = require('fs'); // 图片路径
const path = require('path'); // 图片路径
let uploadDir = './images/';

/**
 * 
 * 获得表单信息
 */
const suTuoGetWareHousingList = async (ctx, next) => {
    try {
    const body = ctx.request.body;
    // console.log(body);
    let totalSql = `SELECT COUNT(R.ID) AS TOTAL FROM  RKD_MX R LEFT JOIN RKD_ZB Z ON R.ID = Z.ID  LEFT JOIN yaojiandayin Y ON R.YPBM = Y.ypbm AND R.SCPH = Y.scph LEFT JOIN BM_YP B ON R.YPBM = B.BM `;
    let startTestSql = `SELECT * from (
        SELECT ROW_NUMBER() OVER(ORDER BY Z.RQ desc,R.ID,Z.DWBM, R.SCPH) as px, Z.RQ, R.ID,Z.DWBM,Z.DWMC,R.YPBM,R.YPMC,R.YPGG,R.JLDW,R.SCCJ,R.PZWH,R.SCPH, Y.img FROM RKD_MX R LEFT JOIN RKD_ZB Z ON R.ID = Z.ID  LEFT JOIN yaojiandayin Y ON R.YPBM = Y.ypbm AND R.SCPH = Y.scph LEFT JOIN BM_YP B ON R.YPBM = B.BM `
    let endTestSql = `)  as t2 where t2.px between ${(body.pageIndex - 1) * body.pageSize + 1} and ${body.pageIndex * body.pageSize}`
    if (body.searchVal.djbh.val) {
        startTestSql += `WHERE R.ID LIKE '%${body.searchVal.djbh.val}%'`;
        totalSql += `WHERE R.ID LIKE '%${body.searchVal.djbh.val}%'`;
    }
    if (body.searchVal.spbh.val) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` R.YPBM LIKE '%${body.searchVal.spbh.val}%'`;
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` R.YPBM LIKE '%${body.searchVal.spbh.val}%'`;
    }
    if (body.searchVal.dwmc.val) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` Z.DWMC LIKE '%${body.searchVal.dwmc.val}%'`;
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` Z.DWMC LIKE '%${body.searchVal.dwmc.val}%'`;
    }
    if (body.searchVal.zjm.val) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` B.JP LIKE '%${body.searchVal.zjm.val}%'`;
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` B.JP LIKE '%${body.searchVal.zjm.val}%'`;
    }
    if (body.searchVal.pihao.val) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` R.SCPH LIKE '%${body.searchVal.pihao.val}%'`;
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` R.SCPH LIKE '%${body.searchVal.pihao.val}%'`;

    }
    if (body.searchVal.time.val[0] !== 'Invalid date' && Boolean(body.searchVal.time.val[0])) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` Z.RQ >= '${body.searchVal.time.val[0]}' and Z.RQ <= '${body.searchVal.time.val[1]}'`;
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` Z.RQ >= '${body.searchVal.time.val[0]}' and Z.RQ <= '${body.searchVal.time.val[1]}'`;
    }
    console.log(body.searchVal.updateTime);
    if (body.searchVal.updateTime.val[0] !== 'Invalid date' && Boolean(body.searchVal.updateTime.val[0])) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` Y.time >= '${body.searchVal.updateTime.val[0]} 00:00:00.000' and Y.time <= '${body.searchVal.updateTime.val[1]} 23:59:59.000'`;
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` Y.time >= '${body.searchVal.updateTime.val[0]} 00:00:00.000' and Y.time <= '${body.searchVal.updateTime.val[1]} 23:59:59.000'`;
    }
    if (body.searchVal.status.val === 1) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` R.YPBM = Y.ypbm AND ISNULL(datalength (Y.img),0) > 0 `
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` R.YPBM = Y.ypbm AND ISNULL(datalength (Y.img),0) > 0 `;
    }
    if (body.searchVal.status.val === 0) {
        startTestSql += startTestSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        startTestSql += ` R.YPBM <>ALL(select ypbm from yaojiandayin WHERE ISNULL(datalength (img),0) > 0 ) `
        totalSql += totalSql.indexOf('WHERE') === -1 ? 'WHERE' : 'AND';
        totalSql += ` R.YPBM <>ALL(select ypbm from yaojiandayin WHERE ISNULL(datalength (img),0) > 0 ) `;
    }

    startTestSql += endTestSql;
    let result = await sql.query(startTestSql);
    let total = await sql.query(totalSql);
    // console.log({ total: total.recordset[0].TOTAL, result: result.recordset });
    ctx.body = { total: total.recordset[0].TOTAL, result: result.recordset };
    } catch(err) {
        throw err
    }
}



/**
 * 上传图片
 * 
 *  */
const suTuoInsertDrugPic = async (ctx, next) => {
    const body = ctx.request.files;
    const data = JSON.parse(ctx.request.body.uploadPicData);
    let removeImg = [];
    if (ctx.request.body.removeImg) {
        removeImg = JSON.parse(ctx.request.body.removeImg);
    }
    let img = [];
    Array.prototype.remove = function (removeVal) {
        let index = this.indexOf(removeVal);
        if (index > -1) {
            this.splice(index, 1);
        }
    }
    let imgSql = `SELECT img FROM yaojiandayin WHERE ypbm = '${data.spid}' AND scph = '${data.pihao}'`;
    let imgResult = await sql.query(imgSql);
    if ( imgResult.recordset[0] && imgResult.recordset[0].img) {
        img = imgResult.recordset[0].img.split(',');
    }

    if (removeImg.length !== 0) {
        removeImg.forEach(item => {
            img.remove(item);
            let picName = item.slice(item.lastIndexOf("\/") + 1, item.length);
            fs.unlink(uploadDir + picName, () => {
            })
        });
    }
    let imgList = [...img];
    if (body.index) {
        if (!(body.index instanceof Array)) {
            body.index = [body.index];
        }
        body.index.forEach((item, ind) => {
            let fileName = item.name;
            let newFileName = Date.now() + '_' + fileName;
            let readStream = fs.createReadStream(item.path);
            let writeStream = fs.createWriteStream(uploadDir + newFileName);
            readStream.pipe(writeStream);
            imgList.push(`http://www.stimg.com/${newFileName}`);
        });
    }
    let imgPath = imgList.join(',');
    let jugdeSql = `SELECT * FROM yaojiandayin WHERE ypbm = '${data.spid}' AND scph = '${data.pihao}'`;
    let isExist = await sql.query(jugdeSql);
    let insertSql = `INSERT INTO yaojiandayin (ypbm, time, img, scph) SELECT '${data.spid}','${data.time}','${imgPath}','${data.pihao}'`;
    let updateSql = `UPDATE yaojiandayin SET time= '${data.time}',img= '${imgPath}' WHERE ypbm = '${data.spid}' AND scph = '${data.pihao}'`;
    let result = ''
    if (isExist.rowsAffected[0] === 0) {
        result = await sql.query(insertSql, body);
    } else {
        result = await sql.query(updateSql);
    }
   
    let isSuccess = result.rowsAffected[0] === 0 ? false : true;
    // console.log(isSuccess);
    ctx.body = { success: isSuccess };
}




module.exports = {
    'POST /suTuoGetWareHousingList': suTuoGetWareHousingList,
    'POST /suTuoInsertDrugPic': suTuoInsertDrugPic
}