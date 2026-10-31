<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'store_id',
        'category_id',
        'brand_id',
        'name',
        'slug',
        'description',
        'condition',
        'price',
        'product_action',
        'custom_action_text',
        'status',
        'moderation_status',
        'is_featured',
        'sold_out_at',
        'published_at',
        'archived_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'brand_id' => 'integer',
            'price' => 'decimal:2',
            'is_featured' => 'boolean',
            'sold_out_at' => 'datetime',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    protected function slug(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null ? null : strtolower(trim($value)),
        );
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ProductPhoto::class)->orderBy('sort_order')->orderBy('id');
    }

    public function productAttributes(): HasMany
    {
        return $this->hasMany(ProductAttribute::class)->orderBy('id');
    }

    public function externalLinks(): BelongsToMany
    {
        return $this->belongsToMany(
            ChannelDefinition::class,
            'product_external_links',
            'product_id',
            'channel_id',
        )->withPivot('url')->withTimestamps();
    }
}
