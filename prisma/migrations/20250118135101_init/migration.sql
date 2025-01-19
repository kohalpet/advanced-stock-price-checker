-- CreateTable
CREATE TABLE "symbols" (
    "id" SERIAL NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "symbols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" SERIAL NOT NULL,
    "symbol_id" INTEGER NOT NULL,
    "date_time" TIMESTAMP NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "symbols_symbol_key" ON "symbols"("symbol");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_symbol_id_fkey" FOREIGN KEY ("symbol_id") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
