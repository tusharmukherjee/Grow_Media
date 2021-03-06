const {UsersModel} = require('../../sqlDB/models/users');
const {BlogsModel} = require('../../sqlDB/models/blogsModel');
const {BlogCommentsModel} = require('../../sqlDB/models/blogsComments');
const {replyCommentModel} = require('../../sqlDB/models/replyComments');
const {BlogLikesModel} = require('../../sqlDB/models/blogsLikes');
const {FriendsModel} = require('../../sqlDB/models/friends');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ExtraInfoModel } = require('../../sqlDB/models/extraInfo');
const {cloudinary} = require('../cloudinary');
const { bCommentLikesModel } = require('../../sqlDB/models/bcommentLikes');

const salt = bcrypt.genSaltSync(10);

const jwtToken = (value) =>  {
    const giveToken = jwt.sign({"user_id": value},
                        process.env.VERIFICATIONTOKEN, { expiresIn: '1d' })
    return giveToken;
    
}

const resolvers = {
    Query: {
        verifyjwtFunc(parent,args, {req,checkContext}){
            return ({"user_id":checkContext(req)})
        },
        users(){
            return UsersModel.query(); /* Resolve all users  */
        },
        user: async (parent, args)=>{
            return await UsersModel.query().select('users.user_id', 'users.profile_img', 'users.username', 'users.bio', 'users.link')
            .select(UsersModel.query().count('blogs.bluser_id').from('blogs').where('blogs.bluser_id', '=', args.id).as('totalblogs'))
            .count('friends.uUser_id',{as:'no_followingbyuser'})
            .from('users')
            .leftJoin('blogs',function(){
              this
              .on('blogs.bluser_id', '=', 'users.user_id')
            })
            .leftJoin('friends',function(){
              this
              .on('friends.uUser_id', '=', 'users.user_id')
            })
            .where('users.user_id','=',args.id);
        }, /* Resolve Blogs of a particular user */
        searchUser(parent, args){
            return UsersModel.query().where('username', 'LIKE', `%${args.searchkeyword}%`);
        }, 

        async blog(_,args){
            return await BlogsModel.query().where('blog_id','=',args.id).withGraphFetched('users');
        },

        async totalcomment(parent, args){
            return await BlogsModel.query().where('blog_id','=',args.id).withGraphFetched('[users,bcomments.[blogsComUsers,bcommentLikesb,replyComments.[replyUsers]]]').modifyGraph('bcomments',builder => {
                builder.select('bcomment_id','blcomment',BlogCommentsModel.relatedQuery('bcommentLikesb').count().as('totalBlogComments'));
              });
        },
        //islike + total like

        async onlycomments(parent, args){
            return await BlogCommentsModel.query().where('blblog_id','=',args.id).withGraphFetched('[blogsComUsers,replyComments.[replyUsers],bcommentLikesb]').modifyGraph('bcommentLikesb',builder => { 
                builder.where('bluser_id','=',args.user_id);
              });
        },
        // fetch only comments

        blogs:async ()=>{
            return await BlogsModel.query().select('blogs.blog_id', 'blogs.heading', 'blogs.created_at', 'blogs.content', 'blogs.b_image', 'users.user_id', 'users.profile_img', 'users.username')
            .countDistinct('blikes.blike_id', {as: 'totalblikes'})
            .countDistinct('bcomments.bcomment_id', {as: 'totalbcomments'})
            .from('blogs')
            .leftJoin('users', function(){
              this
              .on('blogs.bluser_id', '=', 'users.user_id ')
            })
            .leftJoin('blikes', function(){
              this
              .on('blogs.blog_id', '=', 'blikes.blblog_id')
            })
            .leftJoin('bcomments', function(){
              this
              .on('blogs.blog_id', '=', 'bcomments.blblog_id')
            })
            .groupBy('blogs.blog_id')
            .orderBy('blogs.created_at','desc');
        },
        followingblogs:async (_,args)=>{
            return await BlogsModel.query().select('blogs.blog_id', 'blogs.heading', 'blogs.content', 'blogs.b_image', 'blogs.created_at', 'users.user_id', 'users.profile_img', 'users.username')
            .countDistinct('blikes.blike_id', {as: 'totalblikes'})
            .countDistinct('bcomments.bcomment_id', {as: 'totalbcomments'})
            .from('blogs')
            .leftJoin('users', function(){
              this
              .on('blogs.bluser_id', '=', 'users.user_id ')
            })
            .leftJoin('blikes', function(){
              this
              .on('blogs.blog_id', '=', 'blikes.blblog_id')
            })
            .leftJoin('bcomments', function(){
              this
              .on('blogs.blog_id', '=', 'bcomments.blblog_id')
            })
            .leftJoin('friends', function(){
                this
                .on('friends.followers_id', '=', ' users.user_id')
              })
            .whereIn('followers_id',function(){
                this.select('followers_id').from('friends').where('uUser_id','=',args.user_id)
            })
            .groupBy('blogs.blog_id')
            .orderBy('blogs.created_at','desc');
        },
        likeblogs:async (_,args)=>{
            return await BlogsModel.query().select()
            .select(BlogLikesModel.query().countDistinct('blikes.blike_id').from('blikes').where('blikes.blblog_id','=',args.blog_id).as('totalblikes'))
            
            .select(BlogLikesModel.query().select('blikes.bluser_id').from('blikes').where('blikes.blblog_id','=',args.blog_id).andWhere('blikes.bluser_id','=', args.user_id).as('islikedbyuser'))
            .from('blogs')
            .where('blogs.blog_id', '=', args.blog_id)
            .groupBy('blogs.blog_id');
        },

        likecomment: async (_,args) => {
            const ok = await bCommentLikesModel.query().count('bluser_id as a').where('bcomment_id', args.bcomment_id);
            console.log(ok);
            return {"count": ok[0].a, "success": true}
        },
        homeBlogs: async (parent,args)=>{
            return await BlogsModel.query().select('blogs.blog_id', 'blogs.heading', 'blogs.content', 'blogs.b_image', 'blogs.created_at', 'users.user_id', 'users.profile_img', 'users.username')
            .countDistinct('blikes.blike_id', {as: 'totalblikes'})
            .countDistinct('bcomments.bcomment_id', {as: 'totalbcomments'})
            .from('blogs')
            .leftJoin('users', function(){
              this
              .on('blogs.bluser_id', '=', 'users.user_id ')
            })
            .leftJoin('blikes', function(){
              this
              .on('blogs.blog_id', '=', 'blikes.blblog_id')
            })
            .leftJoin('bcomments', function(){
              this
              .on('blogs.blog_id', '=', 'bcomments.blblog_id')
            })
            .where('users.user_id','=',args.id)
            .groupBy('blogs.blog_id')
            .orderBy('blogs.created_at','desc');
        },
        followers: async (_, args)=>{
            return await UsersModel.query().select().count('friends.followers_id',{as: 'followers'})
            .from('users')
            .rightJoin('friends',function(){
              this
              .on('friends.followers_id','=','users.user_id')
            })
            .where('users.user_id', '=', args.user_id);
        },
        async searchBlog(parent, args){
            return await BlogsModel.query().select('blogs.blog_id', 'blogs.heading', 'blogs.content', 'blogs.b_image', 'blogs.created_at', 'users.user_id', 'users.profile_img', 'users.username')
            .countDistinct('blikes.blike_id', {as: 'totalblikes'})
            .countDistinct('bcomments.bcomment_id', {as: 'totalbcomments'})
            .from('blogs')
            .leftJoin('users', function(){
              this
              .on('blogs.bluser_id', '=', 'users.user_id ')
            })
            .leftJoin('blikes', function(){
              this
              .on('blogs.blog_id', '=', 'blikes.blblog_id')
            })
            .leftJoin('bcomments', function(){
              this
              .on('blogs.blog_id', '=', 'bcomments.blblog_id')
            })
            .leftJoin('friends', function(){
                this
                .on('friends.followers_id', '=', ' users.user_id')
              })
            .where('heading', 'LIKE', `%${args.searchkeyword}%`)
            .groupBy('blogs.blog_id')
            .orderBy('blogs.created_at','desc');

        },/* Search a blog with keyword matching word in blog heading or content */
        checksomeone_followers(parent, args){
            return FriendsModel.query().select('uUser_id').where('followers_id',args.user_id).withGraphFetched('friendsUsers');
        },/* Resolve and show someones followers using users ID */
        checksomeone_following(parent, args){
            return FriendsModel.query().select('followers_id').where('uUser_id',args.user_id).withGraphFetched('friendsFollowers');
        },/* Resolves and shows someone following using users ID */
        imgname(){
            const imgLink = "http://localhost:3001/uploads/269150.jpg";
            return {"img":imgLink};
        },
        async isFollowing(parents,args){
            const isFollow = await FriendsModel.query().where('uUser_id',args.user_id).where('followers_id',args.followers_id);
            return {"status":Boolean(isFollow.length),"message":"isFollowing_Request"};
        },

        async infoquery(_,args){
            const allInfo = await UsersModel.query().where('user_id',args.id).withGraphFetched('usersExtraInfo');
            console.log(allInfo);
            return allInfo;
        },

        async isCmntLiked(_,args){
            const iscmntliked = await bCommentLikesModel.query().where('bluser_id',args.user_id).where('bcomment_idLike',args.bcomment_idLike);
            console.log(Boolean(iscmntliked.length));
            return {"status":Boolean(iscmntliked.length),"message":"isCmntLiked_Request"};
        }

    },
// UsersModel.query().select('followers_id').contextwhere('uUser_id',args.user_id).withGraphFetched('blogs');

    Mutation: {

        

        async logout(_,__,{res}){
            res.cookie("aces_token",'', {maxAge: 1, httpOnly:true});
            return true;
        }, //DONE

        async userAuthenticationCheck(parent, args,{ res }){

            const usersblog = await UsersModel.query().where('username', args.username);
            const userAuthPass = usersblog[0].password;
            console.log("called");

            let resultBcrypt = await bcrypt.compare(args.password, userAuthPass);
            console.log(resultBcrypt);

            const jwtAccessToken = jwtToken(usersblog[0].user_id);

            if(resultBcrypt){
                res.cookie("aces_token",jwtAccessToken, {maxAge: 1000 * 60 * 60 * 24, httpOnly:true});
                // res.cookie("access-token",jwtToken, {maxAge: 1000 * 60 * 60 * 24, httpOnly:true});
                // response.cookie("access-token",jwtToken, {maxAge: 1000 * 60 * 60 * 24, httpOnly:true});
                return (
                    {
                        "user_id": usersblog[0].user_id,
                        "username": usersblog[0].username,
                        "authorized": true,
                        "token": jwtAccessToken
                    }
                )
            }else{
                return({
                    "user_id": usersblog[0].user_id,
                    "username": usersblog[0].username,
                    "authorized": false,
                    "token": null
                })
            }
        }, // DONE
        // give array info to check auth 
        createUser: async (parent, args) => {
            const newUser = args.input;
            const {username, email, password} = newUser;
            const hashPass = await bcrypt.hash(password,salt);
            const newUserHash = {
                username,
                email,
                password:hashPass
            }
            await UsersModel.query().insert(newUserHash);
            
            console.log(newUser);
            console.log(newUserHash);
            return newUser;
        }, // DONE

        updateUser: async (parent, args) => {
            const updUser = args;

            await UsersModel.query().patch({"bio": updUser.bio, "link": updUser.link}).where('user_id', args.user_id);
            const check_ei = await ExtraInfoModel.query().where('bluser_id',args.user_id);
            
            console.log(updUser);
            console.log(check_ei.length === 0);
            if(check_ei.length === 0){
                await ExtraInfoModel.query().insert({
                    bluser_id: args.user_id,
                    qualification: args.qualification,
                    hometown:args.hometown,
                    work:args.work,
                    college:args.college
                })
                console.log("first")
            }
            else{
                await ExtraInfoModel.query().patch({
                    'qualification': args.qualification,
                    'hometown':args.hometown,
                    'work':args.work,
                    'college':args.college
                }).where('bluser_id',args.user_id);
                console.log("second");
                return true;
            }
            // return updUser;
        },
        updatePfp: async (_,args) => {
            const uploadResponse = await cloudinary.uploader.upload(args.b_image, {
                upload_preset: "grow_media",
            });
            await UsersModel.query().patch({"profile_img":uploadResponse.public_id+'.'+uploadResponse.format}).where('user_id', args.user_id);;
            return true;
        },
        deleteUser: async (parent, args) => {
            await UsersModel.query().delete().where('user_id', args.user_id);
            console.log(true);
            return true;
        },

        blogData: async (parent, args) => {
            let {user_id, blog_heading, blog_content, blog_image} = await args;
            const uploadResponse = await cloudinary.uploader.upload(blog_image, {
                    upload_preset: "grow_media",
            });
            await BlogsModel.query().insert({"bluser_id": user_id, "b_image": uploadResponse.public_id+'.'+uploadResponse.format,"heading": blog_heading, "content": blog_content});

            return {"isUploaded": true};
        },
        deleteBlog: async(parent,args) => {
            await BlogsModel.query().delete().where('bluser_id',args.user_id).where('blog_id',args.blog_id);
            return {"status":true, "message": "deleted!"};
        },



        likeBlog: async (parents,args) => {
            const isExist = await BlogLikesModel.query().where('bluser_id',args.user_id).where('blblog_id',args.blog_id);
            let value;
            if (!Boolean(isExist.length)){
                value = true;
                console.log(value, "in if, not liked inserting");
                await BlogLikesModel.query().insert({"bluser_id": args.user_id, "blblog_id": args.blog_id});
                return {
                    "status": true,
                    "msg": "liked!"
                };
            }
                value = false;
                console.log(value, "in else, already liked");
                return {
                    "status": false,
                    "msg": "already liked!"
                };
        },
        
        unlikeBlog: async (parents,args) => {
            const isExist = await BlogLikesModel.query().where('bluser_id',args.user_id).where('blblog_id',args.blog_id);
            console.log(Boolean(isExist.length));
            if (Boolean(isExist.length)){
                console.log("deleted like");
                await BlogLikesModel.query().delete().where('bluser_id',args.user_id).where('blblog_id',args.blog_id);
            }
            return {
                "status": true,
                "msg": "unliked!"
            };
        },

        commentBlog: async (parent,args) => {
            return BlogCommentsModel.query().insert({"bluser_id": args.user_id, "blblog_id":args.blog_id, "blcomment":args.commentContent});
        },

        likecommentMutation: async(_,args) => {
            const isExist = await bCommentLikesModel.query().where('bluser_id',args.user_id).where('bcomment_idLike',args.bcomment_idLike);
            console.log(!Boolean(isExist.length));
            if(!Boolean(isExist.length)){
                await bCommentLikesModel.query().insert({"bluser_id": args.user_id, "bcomment_idLike": args.bcomment_idLike});
                return {"status":true, "message": "liked!"}
            }
            else{
                return {"status":false, "message": "liked!"}
            }
        },

        unlikecommentMutation: async (_,args) => {
            const isExist = BlogLikesModel.query().where('bluser_id',args.user_id).where('bcomment_idLike',args.bcomment_idLike);
            if(!Boolean(isExist.length)){
                await bCommentLikesModel.query().delete().where('bluser_id',args.user_id).where('bcomment_idLike',args.bcomment_idLike);
                return {"status":true, "message": "unliked!"}
            }
            else{
                return {"status":false, "message": "unliked!"}
            }
        },
        
        deleteComment: async (parents,args) => {
            return BlogCommentsModel.query().delete().where('bluser_id',args.user_id).where('blblog_id',args.blog_id).where('bcomment_id',args.bcomment_id);
        },
        replyComm: async (parent,args) => {
            return await replyCommentModel.query().insert({"replyUser_id": args.user_id, "parentComment_id": args.parentComment_id, "replied_comment": args.commentContent});
        },
        deleteReplyComment: async (parents,args) => {
            console.log(args);
            await replyCommentModel.query().delete().where('rcomment_id',args.rcomment_id).where('replyUser_id',args.replyUser_id);
            return {"status":true, "message": "deleted!"};
        },


        toFollow: async (parent, args) => {
            // const isExist = await FriendsModel.query().whereExists(function(){FriendsModel.query().whereRaw(`uUser_id = ${args.user_id} AND followers_id = ${args.followers_id}`)});
            const isExist = await FriendsModel.query().where('uUser_id',args.user_id).where('followers_id',args.followers_id);
            if(!(isExist.length)){
                await FriendsModel.query().insert({"uUser_id": args.user_id, "followers_id": args.followers_id});
            }
            console.log(!(isExist.length));
            return {"status": !(isExist.length), "message":"Followed!"};
        },
        toUnfollow: async (parent, args) => {
            const unfollowed = await FriendsModel.query().delete().where('uUser_id',[args.user_id]).where('followers_id', [args.followers_id]);
            console.log(Boolean(unfollowed));
            return {"status":Boolean(unfollowed), "message":"unfollowed!"};
        }
    }
}

module.exports = {resolvers}