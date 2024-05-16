import assert from "node:assert";
import test from "node:test";
import path from "node:path";

import { collect } from "../src/index.js";

const __dirname = new URL('.', import.meta.url).pathname;
const fixtureDir = path.join(__dirname, 'fixtures');

/**
 * @template T
 * @param {AsyncGenerator<T>} generator
 * @returns {Promise<T[]>}
 *
 * Array.fromAsync is available from node v22
 */
async function arrayFromAsync(generator) {
    const ret = [];
    for await(const i of generator) ret.push(i);
    return ret;
}

/**
 * @type {(p: string) => string}
 */
const toRelative = (p) => path.relative(__dirname, p);


test("collect", async (t) => {

    const targets = [
        { src: "src1", dest: "dest1" }
    ];

    const result = await arrayFromAsync(collect(fixtureDir, __dirname, targets))
    assert.equal(result.length, 2)
    assert.equal(toRelative(result[0].src), "fixtures/src1/f1");
    assert.equal(toRelative(result[0].dest), "dest1/f1");

    assert.equal(toRelative(result[1].src), "fixtures/src1/f2");
    assert.equal(toRelative(result[1].dest), "dest1/f2");
});

test("collect:filter", async (t) => {

    const targets = [
        {
            src: "src1",
            dest: "dest2",
            /** @type {(src: string) => boolean} */
            filter: (src) => /.+\/f1$/.test(src),
        }
    ];

    const result = await arrayFromAsync(collect(fixtureDir, __dirname, targets))
    assert.equal(result.length, 1)
    assert.equal(toRelative(result[0].src), "fixtures/src1/f1");
    assert.equal(toRelative(result[0].dest), "dest2/f1");

});
