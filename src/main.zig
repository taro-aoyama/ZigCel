const std = @import("std");

// Export a simple add function to test WASM call from JS
export fn add(a: i32, b: i32) i32 {
    return a + b;
}

// Unit tests in Zig
test "basic add functionality" {
    const testing = std.testing;
    try testing.expect(add(3, 7) == 10);
    try testing.expect(add(-1, 1) == 0);
}

