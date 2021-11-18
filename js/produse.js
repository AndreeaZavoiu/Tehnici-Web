
window.onload=function(){

    var rng=document.getElementById("inp-pret");
	rng.parentNode.insertBefore(document.createTextNode(rng.min),rng);
	rng.parentNode.appendChild(document.createTextNode(rng.max));
    let spval=document.createElement("span");
	rng.parentNode.appendChild(spval)
    rng.value=0;
    spval.innerHTML=" ("+rng.value+")";
    rng.onchange=function(){
        rng.nextSibling.nextSibling.innerHTML=" ("+this.value+")";
    }


    let btn = document.getElementById("filtrare");
    btn.onclick = function(){

        let inp = document.getElementById("i_text");
        let nume_prod_cerut = inp.value         // primul text din input, ce ar reprezenta numele produsului

        inp = document.getElementById("i_textarea");
        let din_textarea = inp.value

        inp = document.getElementById("inp-pret");
        let pret_maxim = inp.value
        console.log("pret_maxim:" + pret_maxim);

        let culori = document.getElementById("i_sel_simplu");
        let sel_simplu = culori.value
        // console.log("sel_simplu:" + sel_simplu);

    
        var lista_preturi_multiple = [];
        var sel_multiplu = document.getElementById("i_sel_multiplu").options; // fiind select multiplu, permite mai multe optiuni in input 
        for (let opt of sel_multiplu){                          // deci trb sa iterez prin ele 
            if (opt.selected)
                lista_preturi_multiple.push(opt.value);         // si sa iau valoarea din fiecare
        }


        var lista_checkboxes = [];  // categoria (comun, ed lim, pers)
        var checkboxes = document.getElementsByName("gr_chck");
        for(let ch of checkboxes) {
		 	  if(ch.checked) 
                lista_checkboxes.push(ch.value);
        }  


        var val_rad="reciclabil" ;  // tipul materialului (ne/ recicl, toate)
        var rad = document.getElementsByName("gr_rad"); // aici, in schimb, e un singur input 
        // console.log("radiobuttons: " + rad);
        for (let opt of rad){
            if (opt.checked)                // deci daca l-am gasit pe cel ales
                val_rad = opt.value;        // ii retin valoarea
                break;                      // iar apoi pot iesi din for pt ca am terminat cautarea
        }


        var produse=document.getElementsByClassName("produs");  // pentru fiecare produs la care am afisat eu nume, pret, lungime, categorie etc
        for (let prod of produse){
            prod.style.display="none";                          // initial nu se afiseaza ca nu stim daca indeplineste conditiile cerute in filtre
            
            // CONDITIA 1 - pe pretul din range
            let pret = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML)   // trebuie parsat pt ca innerHTML ne da un string, dar aici ne trb un int pt pret
                                                                // obs: ne rezulta o lista dar care are un singur element in ea pt ca avem un singur pret pt fiecare produs
                                                                // dar tot trb sa precizez ca vreau primul elem =>  [0]
            let conditie1 = (pret<=pret_maxim)     // conditia 1 e ca pretul maxim sa fie cel selectat in range   => un bool 



            eliminaDiacriticele = function(s){
                var r=s.toLowerCase();
                while ( r.search("ă") != -1) r.replace("ă", "a");
                while ( r.search("â") != -1) r.replace("â", "a"); 
                while ( r.search("î") != -1) r.replace("î", "i"); 
                while ( r.search("ș") != -1) r.replace("ș", "s");
                while ( r.search("ț") != -1) r.replace("ț", "t");
                // for (let i=0; i<r.length; i++) {
                //     console.log("intra in forul din functie")
                //     if (r[i] == "ă") { console.log("intra si in iful pt ă")
                //         r[i] = "a"; //r[i].replace("ă", "a"); 
                //     }
                //     if (r[i] == "â") r[i] = r[i].replace('â', "a");
                //     if (r[i] == "ț") r[i] = r[i].replace('ț', "t");
                //     if (r[i] == "ș") r[i] = r[i].replace('ș', "s");
                // }
                console.log("r=" + r);
                return r;
            };


            // asta era pentru textul din primul input dar nu mi se pare foarte potrivit asa ca momentan las comentat
            let nume_prod = prod.getElementsByClassName("val-nume")[0].innerHTML
            let conditie2 = false;
            if ( eliminaDiacriticele(nume_prod.trim()) == nume_prod_cerut.trim() || nume_prod_cerut.trim() =="..." ) {
                console.log("if cond 2")
                conditie2 = true; }
            console.log("cond2: " + conditie2);

            

            // CONDITIA 3 - pe categoria din checkboxes (selectul multiplu) 
            let categorie_produs = prod.getElementsByClassName("val-categorie")[0].innerHTML    // comun, pers, ed lim
            let conditie3 = false;
            //console.log("lista ch " + lista_checkboxes);
            for (ch of lista_checkboxes){
                // console.log("ch: " +ch , ch.length , "categ " + categorie_produs, categorie_produs.length)
                if (categorie_produs.trim() == ch.trim()) {
                    //console.log("a intrat in iful de la cond 3 => e true")
                    conditie3 = true;}
            }
            

            // CONDITIA 4 - pe tipul reciclabil / ne din radiobuttons (selectul unic)
            let tip_material_recl = prod.getElementsByClassName("val-proprietate")[0].innerHTML // recicl / nerecicl / toate 
            // console.log("val_rad=", val_rad, "tip_mat: " + tip_material_recl);
            let conditie4 = (tip_material_recl.trim() == val_rad.trim() || val_rad.trim() == "toate")

            
            // CONDITIA 5 - pe culorile din selectul simplu 
            let cul = prod.getElementsByClassName("val-culoare")[0].innerHTML
            // console.log("cul: " + cul);
            let conditie5 = false;
            if (cul == sel_simplu || sel_simplu == "toate")
                conditie5 = true;


            // CONDITIA 6 - pe preturile din selectul multiplu 
            let pret_produs = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML)
            let lista_noua_preturi= [];
            for (let i of lista_preturi_multiple) // acesta e un vector de stringuri
                lista_noua_preturi.push( i.split("-"));  // aplic split pe string
            let conditie6 = false;
            // console.log("lista noua preturi: " + lista_noua_preturi);
            for (let p of lista_noua_preturi){ 
                //console.log("p: ", p, pret_produs);
                if ( parseInt(p[0]) <= pret_produs && parseInt(p[1]) >= pret_produs ){
                    //console.log("aici");
                    conditie6 = true;}
            }


            // CONDITIA 7 - pe materialele din textarea - faza cu minus/plus 
            let lista_materiale = prod.getElementsByClassName("val-material")[0].innerHTML
            let dorite = [];
            let nedorite = [];
            let conditie7 = true; // daca nu se precizeaza nimic in textarea, atunci se afiseaza toate produsele
            for (let elem of din_textarea) {
                let cuv = elem.substr(1);   // vreau substringul care sa nu contina primul caracter, adica + sau -, ci doar cuvantul de cautat
                if (elem[0]=="+") {
                    dorite.push(cuv);
                }
                else if (elem[0]=="-") {
                    nedorite.push(cuv);
                }
            }
            for (let el of dorite) { // pt fiecare elem dorit, daca e in produsul meu actual, conditia e implinita
                if (lista_materiale.split(",") == el)  conditie7 = true;
            }
            for (let el of nedorite) { // analog pt elem nedorite
                if (lista_materiale.split(",") == el)  conditie7 = false;
            }
            
            console.log("conditii in ordine=" , conditie1, conditie2, conditie3, conditie4, conditie5 ,conditie6, conditie7);
            let conditieFinala = conditie1 && conditie2 && conditie3 && conditie4 && conditie5 && conditie6 && conditie7; // obs ca nu am mai pus conditia2 aici!
            if (conditieFinala)
                prod.style.display="block"; // daca s-au aplicat filtrele, afisez
            // else alert("Nu ati introdus date corecte!");
        }
    }


    function sortArticole(factor){
        
        var produse=document.getElementsByClassName("produs");
        let arrayProduse = Array.from(produse);
        arrayProduse.sort(function(art1,art2){
            let nume1=art1.getElementsByClassName("val-pret")[0].innerHTML;
            let nume2=art2.getElementsByClassName("val-pret")[0].innerHTML;
            
            let nume3 = art1.getElementsByClassName("val-proprietate")[0].innerHTML;
            let nume4 = art1.getElementsByClassName("val-proprietate")[0].innerHTML;

            if (nume1 == nume2) // daca preturile sunt egale, imi sorteaza dupa tipul materialului(adica reciclabil sau ne)
                return factor*nume3.localeCompare(nume4);
            else return factor*nume1.localeCompare(nume2);
            /*
            let rez=factor*nume1.localeCompare(nume2)
            if (rez==0)
                retrun factor*(pret1-pret2)
            return rez;
            */
        });
        console.log(arrayProduse); 
        for (let prod of arrayProduse){
            prod.parentNode.appendChild(prod);
        }
    }

    btn=document.getElementById("sortCrescNume");
    btn.onclick=function(){
        sortArticole(1);
    }
    btn=document.getElementById("sortDescrescNume");
    btn.onclick=function(){
        sortArticole(-1);
    }

    btn=document.getElementById("resetare");
    btn.onclick=function(){
        // pentru resetarea produselor in pagina : (adica sa apara iar toate produsele)
        // var produse = document.getElementsByClassName("produs");
        // for (let prod of produse){
        //     prod.style.display="block";
        // }
    
        // pentru resetarea filtrelor
        document.getElementById("inp-pret").value = 80;
        document.getElementById("i_text").value = "...";
        document.getElementById("i_textarea").value = "...";
        document.getElementById("i_sel_simplu").value = "toate";
        var sel_multiplu = document.getElementById("i_sel_multiplu").options; 
        for (let opt of sel_multiplu){                           
            opt.selected=true;         
        }
        var checkboxes = document.getElementsByName("gr_chck");
        for(let ch of checkboxes) {
		 	  ch.checked = true;
        }  
        var rad = document.getElementsByName("gr_rad"); 
        for (let opt of rad){
            opt.getElementById("i_rad3").checked = false;
            opt.getElementById("i_rad3").checked = false;
            opt.getElementById("i_rad3").checked = true;
        }

    }

    btn=document.getElementById("calculare");
    btn.onclick=function(){
        var produse = document.getElementsByClassName("produs");
            sumaArt=0;
            for (let prod of produse){ // pt fiecare prod din baza de date
                if (prod.style.display == "block")  // daca e afisat pe ecran (adica selectat de filtre)
                    sumaArt+= parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML); // adauga-i pretul la suma
            }
            let infoSuma = document.createElement("div"); // element de tip div creat dinamic !
            infoSuma.innerHTML = "Suma produselor: "+ sumaArt; // ca si continut adaugam sirul Suma concatenat cu intul suma
            infoSuma.className = "info-produse";
            let p = document.getElementById("calculare")
            p.parentNode.insertBefore( infoSuma, p.nextSibling);
            setTimeout(function(){infoSuma.remove()}, 2000); // 2 secunde
    }


    // calcularea sumei produselor selectate
    // window.onkeydown=function(e){
    //     if (e.key=="c" && e.altKey){
    //         e.preventDefault();
    //         var produse = document.getElementsByClassName("produs");
    //         sumaArt=0;
    //         for (let prod of produse){ // pt fiecare prod din baza de date
    //             if (prod.style.display == "block") // daca e afisat pe ecran (adica selectat de filtre)
    //                 sumaArt+= parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML); // adauga-i pretul la suma
    //         }
    //         let infoSuma = document.createElement("div"); // element de tip div creat dinamic !
    //         infoSuma.innerHTML = "Suma produselor: "+ sumaArt; // ca si continut adaugam sirul Suma concatenat cu intul suma
    //         infoSuma.className = "info-produse";
    //         let p = document.getElementById("p-suma")
    //         p.parentNode.insertBefore( infoSuma, p.nextSibling);
    //         setTimeout(function(){infoSuma.remove()}, 2000); // 2 secunde
    //     }
    // }


    lista_initiala = localStorage.getItem("produse_selectate");     // salvam o lista de produse (vector de id-uri) de pe localStorage
    if (lista_initiala)    // daca nu e nula
        lista_initiala = lista_initiala.split(",");   // dau split dupa virgula
    else
        lista_initiala = [] 

    var checkboxuri_cos = document.getElementsByClassName("select-cos");
    for (let ch of checkboxuri_cos)
    {
        if (lista_initiala.indexOf(ch.value) != -1)  // ch.value este chiar id-ul produsului => daca e in lista noastra de prod selectate, ii bifam checkboxul
            ch.checked=true;        // indexOf() returns the first index at which a given element can be found in the array, or -1 if it is not present.

        ch.onchange=function()      // For radiobuttons and checkboxes, the onchange event occurs when the checked state has been changed.
        {
            ids_produse = localStorage.getItem("produse_selectate")
            if(ids_produse)
                ids_produse = ids_produse.split(",");
            else
                ids_produse = []

            console.log(ids_produse);
            //ids_produse.map(function(elem){return parseInt(elem)});
            //console.log(ids_produse);

            if(ch.checked){
                ids_produse.push(ch.value);
            }
            else{
                ids_produse.splice(ids_produse.indexOf(ch.value), 1)    // stergem un singur (1) element, pe cel cu valoarea precizata
            }
            console.log(ids_produse);   // pt a vedea cum s-a schimbat lista dupa selectare/deselectare
            localStorage.setItem("produse_selectate", ids_produse.join(","))    // 
        }
    }


}
