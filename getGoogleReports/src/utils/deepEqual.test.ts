import {deepEqual} from "./deepEqual"

describe("deepEqual", () => {
    test("0", () => {
        let result: any =
        expect(deepEqual(100, 100)).toBe(true)
    })

    test("1", () => {
        let result: any = deepEqual({}, {})
        expect(result).toBe(true)
    })

    test("2", () => {
        let result: any = deepEqual([], [])
        expect(result).toBe(true)
    })
    test("array and obj", () => {
      let result: any = deepEqual({}, [])
      expect(result).toBe(false)
  })

    test("3", () => {
        let result: any = deepEqual({ a: 1 }, { a: 1 })
        expect(result).toBe(true)
    })

    test("4", () => {
        let result: any = deepEqual(["a"], ["a"])
        expect(result).toBe(true)
    })

    test("5", () => {
        let param1: any = new Date(2000, 0, 1)
        let param2: any = new Date("2000/1/1")
        let result: any = deepEqual(param1, param2)
        expect(result).toBe(true)
    })
    test("5", () => {
      let param1: any = new Date("2000/1/1")
      let param2: any = new Date("2000/1/2")
      let result: any = deepEqual(param1, param2)
      expect(result).toBe(false)
  })
    test("6", () => {
        let param1: any = new RegExp("a")
        let param2: any = new RegExp("a")
        let result: any = deepEqual(param1, param2)
        expect(result).toBe(true)
    })

    test("7", () => {
        let param1: any = new RegExp("a", "i")
        let param2: any = new RegExp("b", "m")
        let result: any = deepEqual(param1, param2)
        expect(result).toBe(false)
    })

    test("8", () => {
        let result: any = deepEqual({ a: [2] }, { a: [2] })
        expect(result).toBe(true)
    })

    test("9", () => {
        let result: any = deepEqual({ a: [1] }, { a: [2] })
        expect(result).toBe(false)
    })

    test("10", () => {
        let result: any = deepEqual({ a: 1, b: 2 }, { a: 1 })
        expect(result).toBe(false)
    })

    test("11", () => {
        let result: any = deepEqual([1], [2])
        expect(result).toBe(false)
    })

    test("12", () => {
        let result: any = deepEqual([1, 2, 3], [1])
        expect(result).toBe(false)
    })

    test("13", () => {
        let result: any = deepEqual({ a: 1 }, { a: 2 })
        expect(result).toBe(false)
    })

    test("14", () => {
        let param1: any = new RegExp("a")
        let param2: any = new RegExp("b")
        deepEqual(param1, param2)
    })
})
