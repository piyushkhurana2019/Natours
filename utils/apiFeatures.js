
class APIFeatures{
    constructor(Query, queryStr){             //querystr to store req.query
        this.Query = Query;
        this.queryStr = queryStr;
    }

    filter(){
    //1A) BASIC FILTERING
    const queryObj = {...this.queryStr};           
    const excludeFields = ['page','sort','limit','fields'];   
    excludeFields.forEach(el=> delete queryObj[el]);   

    //1B) ADVANCE FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`);

    //Build Query
    this.Query = this.Query.find(JSON.parse(queryStr))
    // let Query = Tour.find(JSON.parse(queryStr));

    return this;  // to simply return the whole object so thst it could be used by next method i.e sort in this case
    }

    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.Query = this.Query.sort(sortBy);
        }
        else{
            this.Query = this.Query.sort('-createdAt')
        }
        return this;
    }

    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.Query = this.Query.select(fields);
        }
        else{
            this.Query = this.Query.select('-__v');          // -__v to select all except __v as it is created by mongoose to use it internally and it is of no use to the user
        }
        return this;
    }

    paginate(){
        const Page = this.queryStr.page*1 || 1;

        const Limit = this.queryStr.limit*1 || 100;
        const Skip = (Page-1)*Limit;
        this.Query = this.Query.skip(Skip).limit(Limit); 
        return this;
    }
}

module.exports = APIFeatures;