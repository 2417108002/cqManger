const express = require('express')
const deHelper = require('./dbHelper')
const multer = require('multer')
const path = require('path')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const app = express()
var upload = multer({ dest: 'views/imgs/' })
app.use(express.static("views"))
app.use(bodyParser.urlencoded({ extended: false }))
app.set('trust proxy', 1) // trust first proxy
 
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
 app.use((req,res,next) => {
        if(req.url.indexOf("/hero") === 0){
              if(req.session.userName){
                    next()
              }else{
                  res.send({
                      msg:"请先登录",
                      code:400
                  })
              }
        }
 })
//查询路由
app.get('/list',(req,res)=>{
    const pageNum = req.query.pageNum
    const pageSize = req.query.pageSize
    const query = req.query.query
    deHelper.find('cqlist',{},(results) => {
        results = results.reverse()
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
        res.send(results[0])
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
    let update = {
        heroName,
        skillName,
    }
    const id = req.body.id
    console.log(req.file);
    
    if(req.file){
        const heroIcon = path.join('imgs',req.file.filename)
        update.heroIcon = heroIcon
    }
    deHelper.updateOne('cqlist',{_id: deHelper.ObjectId(id) },update,results=>{
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
//路由6 用户注册
app.post('/register',(req,res)=>{
    deHelper.find('user',{userName:req.body.userName},results=>{
        if(results.length == 0){
               deHelper.insertOne('user',req.body,results=>{
                   res.send({
                       msg:"注册成功",
                       code:200
                   })
               })
        }else{
            res.send({
                msg:"已被注册",
                code:30
            })
        }
    })
})
//路由7 验证码模块
var svgCaptcha = require('svg-captcha');
app.get('/captcha', function (req, res) {
	var captcha = svgCaptcha.create();
	req.session.vcode = captcha.text;
	res.type('svg');
	res.status(200).send(captcha.data);
});

//路由8 登录接口
app.post('/login',(req,res)=>{
    const userName = req.body.userName
    const password = req.body.password
    const vcode = req.body.vcode
    if(req.session.vcode.toLowerCase() === vcode.toLowerCase()){
        deHelper.find('user',{userName},results=>{
            if(results.length > 0){
                req.session.userName = userName
                res.send({
                    msg:"恭喜您,登录成功,欢赢回来",
                    code:200,
                    userName
                })
            }else{
                res.send({
                    msg:"用户名或密码错误",
                    code:400
                })
            }
        })
    }else{
        res.send({
            msg:"验证码填写错误",
            code:401
        })
    }
})

//路由9 登出接口
app.get('/logout',(req,res)=>{
    req.session = null
    res.send({
        msg:"期待你的下次回归",
        code:200
    })
})
app.listen(8848)