from Database.post import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Text, Date, DateTime,ForeignKey, UniqueConstraint, Boolean
#Role
class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String, nullable=False, unique=True)

    users = relationship("User", back_populates="role")

#Users
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False, unique=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    phone_no = Column(String)
    hashed_password = Column(String, nullable=False)
    dob = Column(Date)
    bio = Column(Text)
    profile_pic_url = Column(String, nullable=True)
    created_at = Column(DateTime)

    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)

    role = relationship("Role", back_populates="users")
    posts = relationship("Post", back_populates="user")
    reels = relationship("Reel", back_populates="user")
    stories = relationship("Story", back_populates="user")

    post_likes = relationship("PostLike", back_populates="user")
    post_comments = relationship("PostComment", back_populates="user")
    saved_posts = relationship("SavedPost", back_populates="user")

    reel_comments = relationship("ReelComment", back_populates="user")
    saved_reels = relationship("SavedReel", back_populates="user")

    

    refresh_tokens = relationship("RefreshToken",back_populates="user",cascade="all, delete-orphan",passive_deletes=True)

#Followers
class Follower(Base):
    __tablename__ = "followers"

    follower_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    following_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    followed_at = Column(DateTime)

    follower = relationship("User", foreign_keys=[follower_id])
    following = relationship("User", foreign_keys=[following_id])

#Posts
class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    caption = Column(Text)
    media_url = Column(String, nullable=False)
    media_type = Column(String)
    location = Column(String)
    created_at = Column(DateTime)

    user = relationship("User", back_populates="posts")

    likes = relationship("PostLike", back_populates="post")
    comments = relationship("PostComment", back_populates="post")
    saved_by = relationship("SavedPost", back_populates="post")

#Post_Likes
class PostLike(Base):
    __tablename__ = "post_likes"

    like_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    liked_at = Column(DateTime)

    __table_args__ = (UniqueConstraint("post_id", "user_id"),)

    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="post_likes")

#Post_Comments
class PostComment(Base):
    __tablename__ = "post_comments"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime)

    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="post_comments")

#Saved_Posts
class SavedPost(Base):
    __tablename__ = "saved_posts"

    saved_post_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    saved_at = Column(DateTime)

    __table_args__ = (UniqueConstraint("post_id", "user_id"),)

    post = relationship("Post", back_populates="saved_by")
    user = relationship("User", back_populates="saved_posts")

#Reels
class Reel(Base):
    __tablename__ = "reels"

    reel_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    caption = Column(Text)
    media_url = Column(String, nullable=False)
    audio_name = Column(String)
    duration = Column(Integer)
    created_at = Column(DateTime)

    user = relationship("User", back_populates="reels")

    comments = relationship("ReelComment", back_populates="reel")
    saved_by = relationship("SavedReel", back_populates="reel")

#Reel_Comments
class ReelComment(Base):
    __tablename__ = "reel_comments"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    reel_id = Column(Integer, ForeignKey("reels.reel_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime)

    reel = relationship("Reel", back_populates="comments")
    user = relationship("User", back_populates="reel_comments")

#Saved_Reels
class SavedReel(Base):
    __tablename__ = "saved_reels"

    saved_reel_id = Column(Integer, primary_key=True, autoincrement=True)
    reel_id = Column(Integer, ForeignKey("reels.reel_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    saved_at = Column(DateTime)

    __table_args__ = (UniqueConstraint("reel_id", "user_id"),)

    reel = relationship("Reel", back_populates="saved_by")
    user = relationship("User", back_populates="saved_reels")

#Stories
class Story(Base):
    __tablename__ = "stories"

    story_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    media_url = Column(String, nullable=False)
    media_type = Column(String)
    created_at = Column(DateTime)
    expires_at = Column(DateTime)

    user = relationship("User", back_populates="stories")

#Refresh_Tokens
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    token_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer,ForeignKey("users.user_id", ondelete="CASCADE"),nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime)
    revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="refresh_tokens")
