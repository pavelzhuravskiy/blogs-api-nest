import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import {
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import { blog01Object } from '../utils/objects/blogs.objects';
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
import { invalidURI, longString508 } from '../utils/constants/common.constants';
import {
  commentObject,
  updatedCommentObject,
} from '../utils/objects/comment.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';

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

  describe('Users creation and authentication', () => {
    it(`should create two users`, async () => {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
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
  });

  describe('Find blogs', () => {
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

      blogId = blog.body.id;
    });

    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent blog`, async () => {
      return agent.get(publicBlogsURI + randomUUID()).expect(404);
    });

    // Success
    it(`should return created blogs`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);
      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });
    });
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body).toEqual(blog01Object);

      blogId = blog.body.id;
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
        .post(publicPostsURI + invalidURI + publicCommentsURI)
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
  describe.skip('Update comment', () => {
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
        .put(publicCommentsURI + commentId)
        .send({
          content: commentContent,
        })
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(403);
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
  describe.skip('Delete comment', () => {
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
        .delete(publicCommentsURI + invalidURI)
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
