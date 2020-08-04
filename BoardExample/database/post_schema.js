var mongoose = require('mongoose');
var utils = require('../utils/utils');

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose){
    var PostSchema = mongoose.Schema({
        title:{type:String, trim:true, 'default':''},
        contents:{type:String, trim:true, 'default':''},
        writer:{type:mongoose.Schema.ObjectId, ref:'users'},
        tags:{type:[], 'default':''},
        created_at:{type:Date, index:{unique:false}, 'default':Date.now},
        updated_at:{type:Date, index:{unique:false}, 'default':Date.now},
        comments:[{
            contents:{type:String, trim:true, 'default':''},
            writer:{type:mongoose.Schema.ObjectId, ref:'users'},
            created_at:{type:Date, 'default':Date.now}
        }]
    });

PostSchema.path('title').required(true, '글 제목을 입력해야 합니다.');
PostSchema.path('contents').required(true, '글 내용을 입력해야합니다.');

PostSchema.methods = {
    savePost : function(callback){
        var self = this;

        this.validate(function(err){
            if(err) return callback(err);

            self.savePost(callback);
        });
    },

    addComment : function(user, comment, callback){
        this.comment.push({
            contents : comment.comtents,
            writer : user._id
        });
        this.savePost(callback);
    },

    removeComment : function(id, callback){
        var index = utils.indexOf(this.comments, {id : id});

        if(~index){
            this.comments.splice(index, 1);
        }else{
            return callback('ID [' + id + ']를 가진 댓글 객체를 찾을 수 없습니다.');
        }
        this.savePost(callback);
    }
}

PostSchema.statics = {
    load : function(id, callback){
        this.findOne({_id:id}).populate('writer', 'name provider email')
        .populate('comments.writer')
        .exec(callback);
    },
    list : function(options, callback){
        var criteria = options.criteria || {};

        this.find(criteria).populate('writer', 'name provider email')
        .sort({'created_at':-1})
        .limit(Number(options.perPage))
        .skip(options.perPage * options.page)
        .exec(callback);
    }
}

console.log('PostSchema 정의함');

return PostSchema;

};

module.exports = SchemaObj;