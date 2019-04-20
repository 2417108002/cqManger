const express = require('express')
const deHelper = require('./dbHelper')
const multer = require('multer')
const path = require('path')
const app = express()
var upload = multer({ dest: 'views/imgs/' })
app.use(express.static("views"))
//查询路由
app.get('/list',(req,res)=>{
    const pageNum = req.query.pageNum
    const pageSize = req.query.pageSize
    const query = req.query.query
    deHelper.find('cqlist',{},(results) => {
        const backdata = results.filter( v => {
                if(v.heroName.includes(query) || v.skillName.includes(query)){
                    return true;
                }
        })
        console.log(backdata);
        const startIndex = (pageNum-1)*pageSize
        const endIndex = parseInt(startIndex) + parseInt(pageSize)
        const pageAllnum = Math.ceil( backdata.length / pageSize )
        let list = []
        // 获取当前这一页的数据
      for (let i = startIndex; i < endIndex; i++) {
        if (backdata[i]) {
          list.push(backdata[i])
        }
      }
      res.send({
         list,
         pageAllnum 
      })
    })
})
//详情路由
app.get('/detail',(req,res)=>{
    const id = req.query.id
    deHelper.find('cqlist',{_id: deHelper.ObjectId(id)},results=>{
        // 返回查询的数据
        res.send(results)
    })
})
//英雄添加路由
app.post('/heroAdd',upload.single('heroIcon'),(req,res)=>{
    const heroName = req.body.heroName
    const skillName = req.body.skillName
    const heroIcon = path.join('imgs',req.file.filename)
    deHelper.insertOne('cqlist',{heroName,heroIcon,skillName},results=>{
        res.send({
            msg:"添加成功",
            code:200
        })
    })
})
//英雄修改
app.post('/heroUpdate',upload.single('heroIcon'),(req,res)=>{
    const heroName = req.body.heroName
    const skillName = req.body.skillName
    const heroIcon = path.join('imgs',req.file.filename)
    const id = req.body.id
    deHelper.updateOne('cqlist',{_id: deHelper.ObjectId(id) },{heroName,heroIcon,skillName},results=>{
        res.send({
            msg:"修改成功",
            code:200
        })
    })
})
//英雄删除
app.get('/heroDelete',(req,res)=>{
    const id = req.query.id
    deHelper.deleteOne('cqlist',{_id: deHelper.ObjectId(id) },results=>{
        res.send({
            msg:"删除成功",
            code:200
        })
    })
})
app.listen(8848)