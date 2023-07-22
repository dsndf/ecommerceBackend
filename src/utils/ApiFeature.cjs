const { query } = require("express");


class ApiFeatures {

    constructor(api, query_Str) {
        this.api = api;

        this.query_Str = query_Str
    }

    search() {



        let ob1 = this.query_Str.name ?
            {
                name: {
                    $regex: this.query_Str.name
                    ,
                    $options: 'i'
                }
            }
            : {};



        
      this.api = this.api.find(ob1);


        return this;

    }


    filter() {



        const removeFields = ["name", "limit", "page", "sort", "select"];
        let queryCopy = { ...this.query_Str };
        removeFields.forEach((e) => {
            delete queryCopy[e];
        });
         queryCopy = JSON.stringify(queryCopy);
        queryCopy = queryCopy.replace(/\b(gt|gte|lt|lte)\b/g, (e)=>{
            return `$${e}`;
        });
        queryCopy = JSON.parse(queryCopy);
        this.api = this.api.find(queryCopy);
             
        return this;


    }

    pagination() {

        const { limit, page, sort, select } = this.query_Str

        let p = page || 1;

        let l = limit || 8;


        let ski = (p - 1) * l;
        
        if (sort) {
            let st = sort;

            st = st.split(',').join(' ');



            this.api = this.api.sort(st);
        }
        if (select) {
            let st = select;
            st = st.split(',').join(' ');

            this.api = this.api.select(st);

        }
        this.api = this.api.skip(ski).limit(l);

        return this;


    }
}

module.exports = ApiFeatures;