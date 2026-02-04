<?php

/**
 * Registration Tests
 * 
 * Note: Public registration is DISABLED in this invite-only system.
 * These tests verify that registration is properly blocked.
 */

test('registration screen is not accessible (invite-only system)', function () {
    $response = $this->get('/register');

    // Registration route should return 404 (not found) when registration is disabled
    $response->assertNotFound();
});