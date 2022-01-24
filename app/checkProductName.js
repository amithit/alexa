const axios=require('axios')
var appRoot = require("app-root-path");

const { constants } = require(appRoot + "/config");
const { cache } = constants;
const NO_PRODUCT_END_CONV=`Spero di esserti stata utile. <break time="0.3s" />

Ricordati di consultare sempre il tuo medico in caso di dubbi. <break time="0.3s" />
A presto!`
const NON_JANSSEN_PRODUCT=`
Il prodotto indicato non è un
prodotto Janssen.
Ti invitiamo a conttattare il tuo
medico per assistenza su
questo prodotto.

<break time="0.3s" />

Se manifesti un qualsiasi effetto
indesiderato, compresi quelli
non elencati in questo foglio,
rivolgiti al tuo medico.
Puoi inoltre segnalare
gli effetti indesiderati
direttamente tramite
il sistema nazionale
di segnalazione riportato
all’indirizzo

https://www.aifa.gov.it/content/segnalazioni-
reazioni-avverse.

Segnalando gli effetti
indesiderati puoi contribuire
a fornire maggiori informazioni
sulla sicurezza
di questo medicinale.

<break time="0.3s" />




`+NO_PRODUCT_END_CONV

const JANSSEN_PRODUCT_COVERED_BY_SEERVICE=`Quali informazioni desideri sul prodotto? <break time="0.3s" />
                                                                Stai già assumendo
                                                                questo farmaco?`
const JANSSEN_PRODUCT_NOT_COVERED_BY_SEERVICE=`Il prodotto indicato non è al
                                                momento coperto da questo
                                                servizio. 
                                                Stai già assumendo questo
                                                farmaco?
                                                `
 const checkProduct=async(intentData,sessionId)=>{
    console.log(intentData);
    //condition for asking the product name intent
    if(intentData.name === 'ask_about_product' && intentData.slots
    && intentData.slots.product_name && intentData.slots.product_name.value
    ){
        console.log("Product name found::");
        //here need to call strapi api that the product is janssen or not
        //set the session for productid
        cache.set("session_id" + sessionId, intentData.slots.product_name.value);
        console.log({
            method:"POST",
            url:"https://d3gx9r9x1q137m.cloudfront.net/api/webhooks",
            data:{
                "product_name":intentData.slots.product_name.value,
                question:intentData.name
            }
        });
        const productfind=await axios({
            method:"POST",
            url:"https://d3gx9r9x1q137m.cloudfront.net/api/webhooks",
            data:{
                "product_name":intentData.slots.product_name.value,
                question:intentData.name
            }
        })
        console.log(productfind.data);
        if(productfind && productfind.data && productfind.data.status){
            if(productfind.data.status === 'NOT_JANSSEN_PRODUCT'){
                return NON_JANSSEN_PRODUCT
            }else{
                return productfind.data.status;
            }
            
        }else{
            return NON_JANSSEN_PRODUCT
        }

        

    }else{
        console.log("Product name not found found::");
        return NON_JANSSEN_PRODUCT
    }
}

const ask_product=async(intentData,sessionId)=>{
    console.log(intentData);
    //condition for asking the product name intent
    let product_name=``
    if(intentData.slots
        && intentData.slots.product_name && intentData.slots.product_name.value
        ){
            product_name=intentData.slots.product_name.value
            cache.set("session_id" + sessionId, intentData.slots.product_name.value);

        }else{
            product_name=cache.get("session_id" + sessionId);
        }
        if(product_name && product_name !== ''){
            console.log("Product name found::");
            //here need to call strapi api that the product is janssen or not
            console.log({
                method:"POST",
                url:"https://d3gx9r9x1q137m.cloudfront.net/api/webhooks",
                data:{
                    "product_name":product_name,
                    question:intentData.name
                }
            });
            const productfind=await axios({
                method:"POST",
                url:"https://d3gx9r9x1q137m.cloudfront.net/api/webhooks",
                data:{
                    "product_name":product_name,
                    "question":intentData.name
                }
            })
            console.log(productfind.data);
            if(productfind && productfind.data && productfind.data.status){
               return productfind.data.status
                
            }else{
                return NON_JANSSEN_PRODUCT
            }
        }else{
            return NON_JANSSEN_PRODUCT
        }
       
        

    
}

module.exports = {
    checkProduct,
    ask_product

}
