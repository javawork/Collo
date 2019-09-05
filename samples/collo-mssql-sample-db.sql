CREATE DATABASE "dbtest1"
GO

USE "dbtest1"
GO

CREATE TABLE [dbo].[tb4read] (
  [sqn] [int] IDENTITY(1,1) NOT NULL,
  [company] [char](50) NOT NULL,
  [sales] [int] NOT NULL,
) ON [PRIMARY]
GO


