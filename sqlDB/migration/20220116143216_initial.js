const Knex = require('knex');

/**
 * @param {Knex} knex
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */


exports.up = async (knex) => {
  await knex.schema
        .createTable('users', (table) => {
          table.increments('user_id').unsigned().unique().primary();
          table.string('profile_img',30);
          table.string('username',30).notNullable().unique();
          table.string('email',50).notNullable().unique();
          table.string('password',255).notNullable();
          table.string('bio', 150);
          table.string('link',255);
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })


        .createTable('blogs', (table) => {
          table.increments('blog_id').unsigned().unique().primary();
          table.integer('bluser_id').unsigned();
          table.foreign('bluser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.string('b_image',30);
          table.string('heading',75).notNullable();
          table.string('content',1000); //.notNullable();
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })


        .createTable('blikes', (table) => {
          table.increments('blike_id').unsigned().unique().primary();
          table.integer('bluser_id').unsigned();
          table.foreign('bluser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.integer('blblog_id').unsigned();
          table.foreign('blblog_id').references('blog_id').inTable('blogs').onDelete('CASCADE').onUpdate('CASCADE');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })


        .createTable('bcomments', (table) => {
          table.increments('bcomment_id').unsigned().unique().primary();
          table.integer('bluser_id').unsigned();
          table.foreign('bluser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.integer('blblog_id').unsigned();
          table.foreign('blblog_id').references('blog_id').inTable('blogs').onDelete('CASCADE').onUpdate('CASCADE');
          table.string('blcomment',200);
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })

        .createTable('bcommentLikes', (table) => {
          table.increments('bcommentLike_id').unsigned().unique().primary();
          table.integer('bluser_id').unsigned();
          table.foreign('bluser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.integer('bcomment_idLike').unsigned();
          table.foreign('bcomment_idLike').references('bcomment_id').inTable('bcomments').onDelete('CASCADE').onUpdate('CASCADE');
          
        })


        .createTable('rcomments', (table) => {
          table.increments('rcomment_id').unsigned().unique().primary();
          table.integer('replyUser_id').unsigned();
          table.foreign('replyUser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.integer('parentComment_id').unsigned();
          table.foreign('parentComment_id').references('bcomment_id').inTable('bcomments').onDelete('CASCADE').onUpdate('CASCADE');
          table.string('replied_comment',200); // add blog_id column
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })

        .createTable('friends', (table) => {
          table.increments('friend_id').unsigned().unique().primary();
          table.integer('uUser_id').unsigned();
          table.foreign('uUser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.integer('followers_id').unsigned();
          table.foreign('followers_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.integer('following_id').unsigned(); // delete following check extra.txt
          table.foreign('following_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })


        .createTable('extraInfo', (table) => {
          table.increments('extraInfo_id').unsigned().unique().primary();
          table.integer('bluser_id').unsigned();
          table.foreign('bluser_id').references('user_id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
          table.string('qualification', 10);
          table.string('hometown', 15);
          table.string('work', 15);
          table.string('college',15);
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  // await knex.schema.dropTable('users');
  return knex.schema
      .dropTable("bcommentLikes", function(table) {
        table.dropForeign('bcommentLikes_bluser_id_foreign');
        table.dropForeign('bcommentLikes_bcomment_id_foreign');
      })
      .dropTable("rcomments", function(table) {
        table.dropForeign('rcomments_replyUser_id_foreign');
        table.dropForeign('rcomments_parentComment_id_foreign');
      })
      .dropTable("blikes", function(table) {
        table.dropForeign('blikes_bluser_id_foreign');
        table.dropForeign('blikes_blblog_id_foreign');
      })
      .dropTable("bcomments", function(table) {
        table.dropForeign('bcomments_bluser_id_foreign');
        table.dropForeign('bcomments_blblog_id_foreign');
      })
      .dropTable("blogs", function(table) {
        table.dropForeign('blogs_bluser_id_foreign');
      })
      .dropTable("friends", function(table) {
        table.dropForeign('friends_uUserid_foreign');
        table.dropForeign('friends_followers_id_foreign');
        table.dropForeign('friends_following_id_foreign');
      })
      .dropTable("extraInfo", function(table) {
        table.dropForeign('extraInfo_bluser_id_foreign');
      })
      .dropTable("users");
};
