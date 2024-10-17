<script lang="ts">
  import { cn } from '$lib/utils';

  let { isActive = false, children } = $props<{
    isActive?: boolean;
    children: any;
  }>();

  let className: string | undefined = '';

  let iconClass = $derived(
    cn(
      'flex aspect-square cursor-pointer items-center justify-center rounded-full',
      {
        'text-white opacity-100': isActive,
        'hover:opacity-80': !isActive
      },
      className
    )
  );
</script>

<div class={iconClass}>
  {@render children()}
</div>
