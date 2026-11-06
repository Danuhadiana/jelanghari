<?php

it('renders public cafe landing page for guests', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
