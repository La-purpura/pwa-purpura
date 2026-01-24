-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE INDEX "Post_territoryId_idx" ON "Post"("territoryId");

-- CreateIndex
CREATE INDEX "Post_branchId_idx" ON "Post"("branchId");

-- CreateIndex
CREATE INDEX "PostRead_userId_idx" ON "PostRead"("userId");
