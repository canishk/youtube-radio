from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from app.db.database import Base


class SiteConfiguration(Base):

    __tablename__ = "site_configuration"

    id = Column(Integer,primary_key=True)
    config_key = Column(String(100),nullable=False, unique=True)
    config_value = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())