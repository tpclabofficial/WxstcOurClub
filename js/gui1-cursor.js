// 自定义光标动画
document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.getElementById('cursorFollower');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    // 跟踪鼠标移动
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 动画循环
    function animateCursor() {
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;
        
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        
        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // 按钮悬停放大
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.5)`;
            cursor.style.backgroundColor = 'rgba(0, 198, 255, 0.5)';
        });
        
        button.addEventListener('mouseleave', () => {
            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1)`;
            cursor.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
        });
    });

    // 输入框交互效果
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('mouseenter', () => {
            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.3)`;
            cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        input.addEventListener('mouseleave', () => {
            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1)`;
            cursor.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
        });
    });

    // 添加点击波纹效果
    document.addEventListener('click', function(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    });
});