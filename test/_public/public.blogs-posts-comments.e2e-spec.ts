import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  bloggerMainImageURI,
  bloggerWallpaperImageURI,
  blogSubscriptionURI,
  blogWebsite,
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import {
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  user03Email,
  user03Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import {
  blog01Object,
  createdBlogObject,
} from '../utils/objects/blogs.objects';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { postObject } from '../utils/objects/posts.objects';
import {
  commentContent,
  commentUpdatedContent,
  publicCommentsURI,
} from '../utils/constants/comments.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { contentField } from '../utils/constants/exceptions.constants';
import { longString508 } from '../utils/constants/common.constants';
import {
  commentObject,
  updatedCommentObject,
} from '../utils/objects/comment.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';
import path from 'path';
import { SubscriptionStatus } from '../../src/enums/subscription-status.enum';

describe('Public blogs, posts, comments testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let blogId;
  let postId;
  let commentId;

  let aTokenUser01;
  let aTokenUser02;
  let aTokenUser03;

  describe('Users creation and authentication', () => {
    it(`should create three users`, async () => {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);

      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user03Login,
          password: userPassword,
          email: user03Email,
        })
        .expect(201);
    });
    it(`should log in user 01`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
    it(`should log in user 02`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user02Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser02 = response.body.accessToken;
    });
    it(`should log in user 03`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user03Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser03 = response.body.accessToken;
    });
  });

  describe('Create blog and add images', () => {
    it(`should create new blog of user 01`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      expect(blog.body).toEqual(createdBlogObject);

      blogId = blog.body.id;
    });
    it(`should add wallpaper image (jpg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (jpg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (jpeg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpeg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (png)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.png',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
  });
  describe('Blog subscribe', () => {
    // Auth errors [401]
    it(`should return 401 when trying to subscribe to blog with incorrect token`, async () => {
      await agent
        .post(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when trying to subscribe to nonexistent blog`, async () => {
      await agent
        .post(publicBlogsURI + randomUUID() + blogSubscriptionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should subscribe user 01 to blog`, async () => {
      await agent
        .post(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);
    });
    it(`should subscribe user 02 to blog`, async () => {
      await agent
        .post(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(204);
    });
    it(`should return correct subscribers count`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);

      expect(blog.body.subscribersCount).toBe(2);
    });
  });
  describe('Blog unsubscribe', () => {
    // Auth errors [401]
    it(`should return 401 when trying to unsubscribe from blog with incorrect token`, async () => {
      await agent
        .delete(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when trying to unsubscribe from nonexistent blog`, async () => {
      await agent
        .delete(publicBlogsURI + randomUUID() + blogSubscriptionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should unsubscribe user 01 from blog`, async () => {
      await agent
        .delete(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);
    });

    it(`should return blogs with correct subscribers count`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);
      expect(blogs.body.items[0].subscribersCount).toBe(1);
    });
    it(`should return blog by ID with correct subscribers count`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body.subscribersCount).toBe(1);
    });

    it(`should return blogs with correct user 01 subscriber status`, async () => {
      const blogs = await agent
        .get(publicBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(blogs.body.items[0].currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.Unsubscribed,
      );
    });
    it(`should return blog by ID with correct user 01 subscriber status`, async () => {
      const blog = await agent
        .get(publicBlogsURI + blogId)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(blog.body.currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.Unsubscribed,
      );
    });

    it(`should return blogs with correct user 02 subscriber status`, async () => {
      const blogs = await agent
        .get(publicBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(blogs.body.items[0].currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.Subscribed,
      );
    });
    it(`should return blog by ID with correct user 02 subscriber status`, async () => {
      const blog = await agent
        .get(publicBlogsURI + blogId)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(blog.body.currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.Subscribed,
      );
    });
  });
  describe('Find blogs', () => {
    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent blog`, async () => {
      return agent.get(publicBlogsURI + randomUUID()).expect(404);
    });

    // Success
    it(`should return created blogs for user 01`, async () => {
      const blogs = await agent
        .get(publicBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });

      expect(blogs.body.items[0].currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.Unsubscribed,
      );
    });
    it(`should return created blogs for user 02`, async () => {
      const blogs = await agent
        .get(publicBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });

      expect(blogs.body.items[0].currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.Subscribed,
      );
    });
    it(`should return created blogs for user 03`, async () => {
      const blogs = await agent
        .get(publicBlogsURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });

      expect(blogs.body.items[0].currentUserSubscriptionStatus).toBe(
        SubscriptionStatus.None,
      );
    });
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);

      expect(blog.body).toEqual(blog01Object);
    });
  });
  describe('Find posts', () => {
    it(`should create new post of user 01`, async () => {
      const post = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      postId = post.body.id;
    });
    it(`should add main image (jpg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'post',
        'main',
        'main_940x432_79kb.jpg',
      );

      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });

    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent post`, async () => {
      return agent.get(publicPostsURI + randomUUID()).expect(404);
    });
    it(`should return 404 when trying to get post for nonexistent blog`, async () => {
      return agent
        .get(publicBlogsURI + randomUUID() + publicPostsURI)
        .expect(404);
    });

    // Success
    it(`should return created posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postObject],
      });
    });
    it(`should return created post for blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postObject],
      });
    });
    it(`should return created post by ID`, async () => {
      const post = await agent.get(publicPostsURI + postId).expect(200);
      expect(post.body).toEqual(postObject);
    });
  });
  describe('Create comment', () => {
    // Validation errors [400]
    it(`should return 400 when trying to create comment without content`, async () => {
      const response = await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });
    it(`should return 400 when trying to create comment with incorrect content type`, async () => {
      const response = await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .send({
          content: 123,
        })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });
    it(`should return 400 when trying to create comment with incorrect content length`, async () => {
      const response = await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .send({
          content: longString508,
        })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to create comment with incorrect access token`, async () => {
      return agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .send({
          content: commentContent,
        })
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when trying to create comment for nonexistent post`, async () => {
      return agent
        .post(publicPostsURI + randomUUID() + publicCommentsURI)
        .send({
          content: commentContent,
        })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should create new comment for created post`, async () => {
      await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
  });
  describe('Find comments', () => {
    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent comment`, async () => {
      return agent.get(publicCommentsURI + randomUUID()).expect(404);
    });

    // Success
    it(`should return created comments`, async () => {
      const comments = await agent
        .get(publicPostsURI + postId + publicCommentsURI)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [commentObject],
      });

      commentId = comments.body.items[0].id;
    });
    it(`should return comment by ID`, async () => {
      const comment = await agent
        .get(publicCommentsURI + commentId)
        .expect(200);

      expect(comment.body).toEqual(commentObject);
    });
  });
  describe('Update comment', () => {
    // Auth errors [401]
    it(`should return 401 when trying to update comment with incorrect access token`, async () => {
      return agent
        .put(publicCommentsURI + commentId)
        .send({
          content: commentUpdatedContent,
        })
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to update another user's comment`, async () => {
      return agent
        .put(publicCommentsURI + commentId)
        .send({
          content: commentUpdatedContent,
        })
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to update nonexistent comment`, async () => {
      return agent
        .put(publicCommentsURI + randomUUID())
        .send({
          content: commentContent,
        })
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should update comment by ID`, async () => {
      await agent
        .put(publicCommentsURI + commentId)
        .send({
          content: commentUpdatedContent,
        })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);

      const check = await agent.get(publicCommentsURI + commentId).expect(200);
      expect(check.body).toEqual(updatedCommentObject);
    });
  });
  describe('Delete comment', () => {
    // Auth errors [401]
    it(`should return 401 when trying to delete comment with incorrect access token`, async () => {
      return agent
        .delete(publicCommentsURI + commentId)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to delete another user's comment`, async () => {
      return agent
        .delete(publicCommentsURI + commentId)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to delete nonexistent comment`, async () => {
      return agent
        .delete(publicCommentsURI + randomUUID())
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should delete comment by ID`, async () => {
      await agent
        .delete(publicCommentsURI + commentId)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);

      return agent.get(publicCommentsURI + commentId).expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
