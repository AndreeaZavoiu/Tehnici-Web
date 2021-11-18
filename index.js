const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const url = require('url');
const { exec } = require("child_process");
const ejs=require('ejs');
const {Client} = require('pg');

var app = express(); //am creat serverul

app.set("view engine", "ejs"); //setez ca motor de template ejs
app.use("/resurse", express.static(__dirname+"/resurse"));

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'andreea', 
    password: 'tehniciweb',
    database: 'proiect'
});
client.connect();
// client.query("select id, nume from produse", function(err, rez){
//     console.log(err,rez);
// })


function getSeasonByMonthNumber(month) {
    if (month == 11 || month == 0 || month == 1)
        return 'winter';
    if (month == 2 || month == 3 || month == 4)
        return 'spring';
    if (month == 5 || month == 6 || month == 7)
            return 'summer';
    if (month == 8 || month == 9 || month == 10)
        return 'fall';
}
function getSeasonByMonthName(month){
    if (month == "decembrie" || month == "ianuarie" || month == "februarie")
        return 'winter';
    if (month == "martie" || month == "aprilie" || month == "mai")
        return 'spring';
    if (month == "iunie" || month == "iulie" || month == "august")
        return 'summer';
    if (month == "septembrie" || month == "octombrie" || month == "noiembrie")
        return 'fall';
}

function verificaImagini(){
	var textFisier=fs.readFileSync("resurse/json/galerie.json") // citeste tot fisierul
	var jsi=JSON.parse(textFisier); // am transformat in obiect

	var caleGalerie=jsi.cale_galerie;
    let vectImagini=[]

    let currentDate = new Date();
    let currentSeason = getSeasonByMonthNumber(currentDate.getMonth());
    // console.log("anotimpul curent este", currentSeason);

	for (let im of jsi.imagini){
		var imVeche= path.join(caleGalerie, im.cale_fisier); // obtin claea completa (im.fisier are doar numele fisierului din folderul caleGalerie)
		var ext = path.extname(im.cale_fisier); // obtin extensia
		var numeFisier =path.basename(im.cale_fisier,ext) // obtin numele fara extensie
		let imNoua=path.join(caleGalerie+"/mic/", numeFisier+"-mic"+".webp");//creez cale apentru imaginea noua; prin extensia wbp stabilesc si tipul ei
		

        for (let i=0; i<im.luni.length; i++){
            if (currentSeason == getSeasonByMonthName(im.luni[i])) {
                vectImagini.push({mare:imVeche, mic:imNoua, titlu:im.titlu}); //adauga in vector elementul cu luna potrivita
                // console.log("anotimpul imaginii este", getSeasonByMonthName(im.luni[i]) );
                break;
            }
        }
        
        if (!fs.existsSync(imNoua))//daca nu exista imaginea, mai jos o voi crea
		sharp(imVeche)
		  .resize(350) //daca dau doar width(primul param) atunci height-ul e proportional
		  .toFile(imNoua, function(err) {
              if(err)
			    console.log("eroare conversie",imVeche, "->", imNoua, err);
		  });
	}
    // [ {mare:cale_img_mare, mic:cale_img_mica, descriere:text}, {mare:cale_img_mare, mic:cale_img_mica, descriere:text}, {mare:cale_img_mare, mic:cale_img_mica, descriere:text}  ]
    return vectImagini;
}


app.get(["/","/index"], function(req, res) { //ca sa pot accesa pagina principala si cu localhost:8080 si cu localhost:8080/index
    res.render("pagini/index", {imagini1: verificaImagini(), ip:req.ip, imagini2: verificaImagini()}); /* relative intotdeauna la folderul views*/
});

// Cerere de tip get pentru pagina despre istoric, accesata din meniu
app.get("/istoric",  function(req,res){
    res.render("pagini/istoric");
});

app.get("/acasa",  function(req,res){
    res.render("index.ejs");
});

app.get("*/galerie-animata.css",function(req, res){

    res.setHeader("Content-Type","text/css"); //pregatesc raspunsul de tip css
    let sirScss = fs.readFileSync("./resurse/scss/galerie-animata.scss").toString("utf-8"); //citesc scss-ul cs string
    // Getting a random number between two values
        // This example returns a random number between the specified values. The returned value is no lower than (and may possibly equal) min, and is less than (and not equal) max.
        // function getRandomArbitrary(min, max) { return Math.random() * (max - min) + min; }
    let varAleatoare = Math.floor(Math.random()*8 + 6); // *(14-6)+6 = *8+6
    // console.log(varAleatoare);
    let rezScss=ejs.render(sirScss,{nr_poze:varAleatoare});
    // console.log(rezScss);
    fs.writeFileSync("./temp/galerie-animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar
    
    exec("sass ./temp/galerie-animata.scss ./temp/galerie-animata.css", (error, stdout, stderr) => { //execut comanda sass (asa cum am executa in cmd sau PowerShell)
        if (error) {
            console.log(`error: ${error.message}`);
            res.end(); //termin transmisiunea in caz de eroare
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            res.end();
            return;
        }
        console.log(`stdout: ${stdout}`);
        // totul a fost bine, trimit fisierul rezultat din compilarea scss
        res.sendFile(path.join(__dirname,"temp/galerie-animata.css"));
    });
});

// Redarea paginii 403 atunci cand este accesata galeria
app.get("/galerie.json", function(req,res){
    res.status(403).render("pagini/403");
});


app.get("/produse",  function(req,res){
    let conditie= req.query.proprietate ?  " and proprietate='"+req.query.proprietate+"'" : "";
    client.query("select id, nume, pret, lungime, categorie, culoare, proprietate, descriere, material, imagine, data_adaugare from produse where 1=1"+conditie, function(err, rez){ // select coloane from tabel
        client.query("select unnest(enum_range( null::categ_produse)) as categ", function(err,rezCateg){//selectez toate valorile posibile din enum-ul categ_prajitura
        res.render("pagini/produse", {produse: rez.rows, categorie: rezCateg.rows});
        //console.log("===", rez.rows);
        });  
    });
});



//-----------------cos virtual ------------------------
app.post("/produse_cos",function(req, res){
    
	console.log("req.body: ",req.body);
    console.log(req.get("Content-type"));
    console.log("body: ",req.get("body"));

    /* prelucrare pentru a avea toate id-urile numerice si pentru a le elimina pe cele care nu sunt numerice */
    var iduri=[]
    for (let elem of req.body.ids_prod){
        let num=parseInt(elem);
        if (!isNaN(num))
            iduri.push(num);
    }
    if (iduri.length==0){
        res.send("eroare");
        return;
    }

    console.log("select id, nume, pret, gramaj, calorii, categorie, imagine from prajituri where id in ("+iduri+")");
    client.query("select id, nume, pret, gramaj, calorii, categorie, imagine from prajituri where id in ("+iduri+")", function(err,rez){
        console.log(err, rez);
        //console.log(rez.rows);
        res.send(rez.rows);
       
       
    });

    
});


app.post("/cumpara",function(req, res){
    if(!req.session.utilizator){
        res.write("Nu puteti cumpara daca nu sunteti logat!");res.end();
        return;
    }
    console.log("select id, nume, pret, gramaj, calorii, categorie, imagine from prajituri where id in ("+req.body.ids_prod+")");
    client.query("select id, nume, pret, gramaj, calorii, categorie, imagine from prajituri where id in ("+req.body.ids_prod+")", function(err,rez){
        console.log(err, rez);
        //console.log(rez.rows);
        console.log(req.session.utilizator);
        let rezFactura=ejs.render(fs.readFileSync("views/pagini/factura.ejs").toString("utf-8"),{utilizator:req.session.utilizator,produse:rez.rows});
        console.log(rezFactura);
        let options = { format: 'A4' };

        let file = { content: rezFactura };

        html_to_pdf.generatePdf(file, options).then(function(pdf) {
            var numefis="temp/test"+(new Date()).getTime()+".pdf";
            fs.writeFileSync(numefis,pdf);
            trimitefactura(req.session.utilizator.username, req.session.utilizator.email, numefis);
            res.write("Totu bine!");res.end();
        });
       
        
       
    });

    
});



app.get("/unprodus/:id",  function(req,res){
    client.query("select * from produse where id="+req.params.id, function(err, rez){ // concatenam id-ul
        res.render("pagini/produse", {produse: rez.rows[0]});
    });
});

app.get("/*", function(req, res) { // OBS: nu trb pus inaintea altor geturi de genul!
    res.render("pagini" + req.url, function(err, rezultatRandare){
        if (err){
            if (err.message.includes("Failed to lookup view")){
                res.status(404).render("pagini/404");
            }
            else 
                throw err;
        }
        else {
            res.send(rezultatRandare);
        }
    });
});


// app.listen(8080);
const port = 8080;
app.listen(process.env.PORT || port, () => console.log('App listening at http://localhost:${port}'));
console.log("Serverul a pornit!");