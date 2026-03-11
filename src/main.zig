const std = @import("std");

// Use the WebAssembly page allocator directly for freestanding environments
const allocator = std.heap.wasm_allocator;

// Map: Cell coordinates (col << 32 | row) -> Cell content (string)
var cells: std.AutoHashMap(u64, []u8) = undefined;

// Fixed buffer for JS to write incoming strings before parsing
var input_buffer: [4096]u8 = undefined;

// --- Exported WebAssembly Functions ---

/// Initialize the engine (called from JS once WASM is loaded)
export fn initEngine() void {
    cells = std.AutoHashMap(u64, []u8).init(allocator);
}

/// Returns the pointer to the input buffer where JS should write the cell string
export fn getMemoryBuffer() [*]u8 {
    return &input_buffer;
}

/// JS calls this after writing `len` bytes into the input buffer
export fn setCellValue(col: u32, row: u32, len: usize) void {
    const key = getCellKey(col, row);
    
    // If length is 0, it means the cell was cleared.
    if (len == 0) {
        if (cells.fetchRemove(key)) |kv| {
            allocator.free(kv.value);
        }
        return;
    }

    const input_str = input_buffer[0..len];

    // Evaluate the text (handle formulas if it starts with '=')
    // We ignore errors in this prototype and just don't save anything if it completely fails.
    const calculated_str = evaluateFormula(input_str) catch return;

    // If the cell already exists, free the old string memory to prevent leaks
    if (cells.fetchRemove(key)) |kv| {
        allocator.free(kv.value);
    }

    // Store the new calculated string in the HashMap
    _ = cells.put(key, calculated_str) catch {};
}

/// Returns the pointer to the stored string for a specific cell
export fn getCellValuePtr(col: u32, row: u32) ?[*]const u8 {
    const key = getCellKey(col, row);
    if (cells.get(key)) |val| {
        return val.ptr;
    }
    // Return an optional pointer which becomes 0 (null) in WASM FFI
    return null;
}

/// Returns the length of the stored string for a specific cell
export fn getCellValueLen(col: u32, row: u32) usize {
    const key = getCellKey(col, row);
    if (cells.get(key)) |val| {
        return val.len;
    }
    return 0;
}

// --- Internal Helper Functions ---

/// Packs column and row into a single 64-bit integer for HashMap keys
fn getCellKey(col: u32, row: u32) u64 {
    return (@as(u64, col) << 32) | @as(u64, row);
}

/// A very primitive evaluator for demo purposes (e.g. interprets "=5+7")
fn evaluateFormula(input: []const u8) ![]u8 {
    // Not a formula, just duplicate the string and return
    if (input.len == 0 or input[0] != '=') {
        return allocator.dupe(u8, input);
    }

    const formula = input[1..];
    
    // Very basic parsing: look for a '+' sign and evaluate addition
    if (std.mem.indexOf(u8, formula, "+")) |plus_idx| {
        const left_str = std.mem.trim(u8, formula[0..plus_idx], " ");
        const right_str = std.mem.trim(u8, formula[plus_idx+1..], " ");
        
        const left_val = std.fmt.parseInt(i32, left_str, 10) catch return allocator.dupe(u8, "#ERROR");
        const right_val = std.fmt.parseInt(i32, right_str, 10) catch return allocator.dupe(u8, "#ERROR");
        
        const result = left_val + right_val;
        return std.fmt.allocPrint(allocator, "{d}", .{result}); // Allocates a new string for the result
    }
    
    // If not recognized as a supported formula, just return the formula text itself
    return allocator.dupe(u8, input);
}
