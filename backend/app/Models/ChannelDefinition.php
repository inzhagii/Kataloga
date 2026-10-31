<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ChannelDefinition extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_external_links',
            'channel_id',
            'product_id',
        )->withPivot('url')->withTimestamps();
    }
}
