import Koa from 'koa'
import koaBody from 'koa-body'
import router from './router/router';
import path from 'path';

const serve = require('koa-static');
const app = new Koa();

// 配置静态文件中间件，提供 public 文件夹的内容
const publicDir = path.join(__dirname, '../public');
console.log(publicDir);

app.use(serve(publicDir));

//使用插件
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFieldsSize: 10 * 1024 * 1024, // 限制上传文件大小10M
    },
}));
//错误拦截器
app.use((ctx, next) => {
    //跨域
    // ctx.set("Access-Control-Allow-Origin", "*")
    let { method, url } = ctx
    console.log({ method, url });
    return next().catch((err) => {
        console.log(err);
    })
})

app.use(async (ctx, next) => {
    if (ctx.path === '/') {
        ctx.redirect('/index.html');
    } else {
        await next();
    }
});

//使用路由
app.use(router.routes())


app.listen(4545)
console.log('server is running at: http://localhost:4545');
