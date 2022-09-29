
var plugin = function (options) {
    var seneca = this;

    seneca.add({ role: 'products', cmd: 'add' }, function (msg, respond) {
        this.make('products').data$(msg.data).save$(respond);
    });

    seneca.add({ role: 'products', cmd: 'get' }, function (msg, respond) {
        this.make('products').load$(msg.data.product_id, respond);
    });

    seneca.add({ role: 'products', cmd: 'get-all' }, function (msg, respond) {
        this.make('products').list$({}, respond);
    });

    seneca.add({ role: 'products', cmd: 'delete' }, function (msg, respond) {
        this.make('products').remove$(msg.data.product_id, respond);
    });


}

module.exports = plugin;



var seneca = require("seneca")();
seneca.use(plugin);
seneca.use('seneca-entity');

seneca.add('role:api, cmd:add-product', function (args, done) {
    console.log("--> cmd:add-product");
    var products = {
        product: args.product,
        price: args.price,
        category: args.category
    }
    console.log("--> products: " + JSON.stringify(products));
    seneca.act({ role: 'products', cmd: 'add', data: products }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });
});

seneca.add('role:api, cmd:get-all-products', function (args, done) {
    console.log("--> cmd:get-all-products");
    seneca.act({ role: 'products', cmd: 'get-all' }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });
});

seneca.add('role:api, cmd:get-product', function (args, done) {
    console.log("--> cmd:get-product, args.product_id: " + args.product_id);
    seneca.act({ role: 'products', cmd: 'get', data: { product_id: args.product_id } }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });
});


seneca.add('role:api, cmd:delete-product', function (args, done) {
    console.log("--> cmd:delete-product, args.product_id: " + args.product_id);
    seneca.act({ role: 'products', cmd: 'delete', data: { product_id: args.product_id } }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });
});

seneca.add('role:api, cmd:delete-all-products', function (args, done) {
    done(null, { cmd: "delete-all-products" });
    seneca.act({ role: 'products', cmd: 'delete-all' }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });
});

seneca.act('role:web', {
    use: {
        prefix: '/products',
        pin: { role: 'api', cmd: '*' },
        map: {
            'add-product': { GET: true ,POST:true},
            'get-all-products': { GET: true },
            'get-product': { GET: true, },
            'delete-all-products': { GET: true, }
        }
    }
})

let countGET=0;
let countPOST=0;

function countMiddleware(req,res,next){
    if (req.method === "GET") countGET++;
    if (req.method === "POST") countPOST++;
    console.log(`Processed Request Count---> GET: ${countGET}, and POST:${countPOST}`);
    if(next)next();
}

var express = require('express');
var app = express();
app.use(countMiddleware)
app.use(require("body-parser").json())
app.use(seneca.export('web'));



app.listen(3009)
console.log("Server listening on localhost:3009....");
console.log("----- Requests -------------------------");
console.log("http://localhost:3009/products/add-product?product=Laptop&price=201.99&category=PC");
console.log("http://localhost:3009/products/get-all-products");
console.log("http://localhost:3009/products/delete-all-products");
//console.log("http://localhost:3009/products/get-user?user_id=1245");
// console.log("http://localhost:3009/products/delete-user?user_id=1245");